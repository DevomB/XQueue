import { randomBytes } from "node:crypto";
import { createServer, type Server } from "node:http";
import {
  buildAuthorizeUrl,
  generatePkce,
  toXCredentials,
  type PostStatus,
} from "@postwave/core";
import { isLinkPost } from "@postwave/shared";
import type { ScheduledPost } from "@postwave/core";
import type { SqlitePostRepository } from "@postwave/storage-sqlite";
import { writeConfig } from "./config.js";
import type { RuntimeContext } from "./runtime.js";

const CATCH_UP_GAP_MS = 6_000;

function toPostItem(post: ScheduledPost) {
  return {
    id: post.id,
    text: post.text,
    scheduledAt: post.scheduledAt?.toISOString() ?? null,
    status: post.status,
    failureReason: post.failureReason ?? null,
    isLinkPost: isLinkPost(post.text),
    mediaUrls: post.mediaPaths,
    xTweetId: post.xTweetId ?? null,
    publishedAt: post.publishedAt?.toISOString() ?? null,
  };
}

function repo(ctx: RuntimeContext): SqlitePostRepository {
  return ctx.storage.repo as SqlitePostRepository;
}

function scheduleIfNeeded(
  ctx: RuntimeContext,
  post: ScheduledPost | null
): void {
  if (post?.scheduledAt && post.status === "SCHEDULED") {
    ctx.storage.scheduler.schedule(post.id, post.scheduledAt);
  }
}

async function handleMethod(
  ctx: RuntimeContext,
  method: string,
  params: Record<string, unknown> | undefined
): Promise<unknown> {
  switch (method) {
    case "postwave.listPosts": {
      const posts = await repo(ctx).list({
        status: params?.status as PostStatus | undefined,
        limit: (params?.limit as number) ?? 100,
      });
      return { posts: posts.map(toPostItem) };
    }
    case "postwave.schedulePost": {
      const scheduledAt = params?.scheduledAt
        ? new Date(String(params.scheduledAt))
        : null;
      const post = await repo(ctx).create({
        text: String(params?.text ?? ""),
        scheduledAt,
        timezone: String(params?.timezone ?? ctx.config.timezone ?? "UTC"),
        mediaPaths: (params?.mediaPaths as string[]) ?? [],
        status: (params?.status as "DRAFT" | "SCHEDULED") ?? "SCHEDULED",
      });
      scheduleIfNeeded(ctx, post);
      return { post: toPostItem(post) };
    }
    case "postwave.bulkCreatePosts": {
      const items = (params?.posts as Array<Record<string, unknown>>) ?? [];
      const timezone = String(
        params?.timezone ?? ctx.config.timezone ?? "UTC"
      );
      const created: ReturnType<typeof toPostItem>[] = [];
      for (const item of items) {
        const scheduledAt = item.scheduledAt
          ? new Date(String(item.scheduledAt))
          : null;
        const isDraft = Boolean(item.isDraft) || !scheduledAt;
        const post = await repo(ctx).create({
          text: String(item.text ?? ""),
          scheduledAt,
          timezone,
          mediaPaths: (item.mediaPaths as string[]) ?? [],
          status: isDraft ? "DRAFT" : "SCHEDULED",
        });
        scheduleIfNeeded(ctx, post);
        created.push(toPostItem(post));
      }
      return { posts: created };
    }
    case "postwave.updatePost": {
      const id = String(params?.id ?? "");
      const patch: {
        text?: string;
        scheduledAt?: Date | null;
        status?: PostStatus;
        mediaPaths?: string[];
      } = {};
      if (params?.text !== undefined) patch.text = String(params.text);
      if (params?.scheduledAt === null) {
        patch.scheduledAt = null;
      } else if (params?.scheduledAt !== undefined) {
        patch.scheduledAt = new Date(String(params.scheduledAt));
      }
      if (params?.status !== undefined) {
        patch.status = params.status as PostStatus;
      }
      if (params?.mediaPaths !== undefined) {
        patch.mediaPaths = params.mediaPaths as string[];
      }

      const existing = await repo(ctx).findById(id);
      if (!existing) {
        throw new Error("Post not found");
      }

      ctx.storage.scheduler.cancel(id);
      const post = await repo(ctx).update(id, patch);
      scheduleIfNeeded(ctx, post);
      return { post: toPostItem(post!) };
    }
    case "postwave.deletePost": {
      const id = String(params?.id ?? "");
      ctx.storage.scheduler.cancel(id);
      const ok = await repo(ctx).delete(id);
      if (!ok) {
        throw new Error("Post not found");
      }
      return { ok: true };
    }
    case "postwave.cancelPost": {
      const id = String(params?.id ?? "");
      await repo(ctx).cancel(id);
      ctx.storage.scheduler.cancel(id);
      return { ok: true };
    }
    case "postwave.retryPost": {
      const id = String(params?.id ?? "");
      const ok = await repo(ctx).retry(id);
      if (!ok) {
        throw new Error("Post not found or not failed");
      }
      const post = await repo(ctx).findById(id);
      if (post?.scheduledAt) {
        ctx.storage.scheduler.schedule(id, post.scheduledAt);
      } else {
        const retryAt = new Date(Date.now() + 60_000);
        const updated = await repo(ctx).update(id, {
          scheduledAt: retryAt,
          status: "SCHEDULED",
        });
        if (updated?.scheduledAt) {
          ctx.storage.scheduler.schedule(id, updated.scheduledAt);
        }
      }
      const refreshed = await repo(ctx).findById(id);
      return { post: toPostItem(refreshed!) };
    }
    case "postwave.getStatus": {
      const tokens = await ctx.storage.tokenStore.getTokens();
      const missed = await repo(ctx).countMissed();
      return {
        connected: Boolean(tokens),
        username: tokens?.xUsername ?? null,
        nextRunAt: ctx.storage.scheduler.nextRunAt()?.toISOString() ?? null,
        missedCount: missed,
      };
    }
    case "postwave.getSettings": {
      const tokens = await ctx.storage.tokenStore.getTokens();
      return {
        timezone: ctx.config.timezone ?? "UTC",
        xAccounts: tokens
          ? [
              {
                id: "default",
                username: tokens.xUsername ?? "unknown",
              },
            ]
          : [],
      };
    }
    case "postwave.updateSettings": {
      const timezone = String(params?.timezone ?? "UTC");
      ctx.config = { ...ctx.config, timezone };
      writeConfig(ctx.config);
      return { timezone };
    }
    case "postwave.listMissed": {
      const posts = await repo(ctx).findMissedPosts();
      return { posts: posts.map(toPostItem) };
    }
    case "postwave.catchUp": {
      const postIds = params?.postIds as string[] | undefined;
      let missed = await repo(ctx).findMissedPosts();
      if (postIds?.length) {
        const allowed = new Set(postIds);
        missed = missed.filter((post) => allowed.has(post.id));
      }

      let published = 0;
      for (let i = 0; i < missed.length; i++) {
        if (i > 0) {
          await new Promise((resolve) => setTimeout(resolve, CATCH_UP_GAP_MS));
        }
        try {
          await ctx.publisher.publishPost(missed[i].id);
          const updated = await repo(ctx).findById(missed[i].id);
          if (updated?.status === "PUBLISHED") {
            published++;
          }
        } catch {
          // continue with remaining posts
        }
      }
      return { published };
    }
    case "postwave.uploadImage": {
      const data = String(params?.data ?? "");
      const mimeType = String(params?.mimeType ?? "application/octet-stream");
      const buffer = Buffer.from(data, "base64");
      const savedPath = await ctx.mediaStorage.saveMedia(buffer, mimeType);
      return { path: savedPath };
    }
    case "postwave.disconnectX": {
      await ctx.storage.tokenStore.clear();
      return { ok: true };
    }
    case "postwave.connectX": {
      const credentials = toXCredentials(ctx.config);
      if (!credentials.clientId) {
        throw new Error("X client ID is not configured");
      }
      const { challenge } = generatePkce();
      const state = randomBytes(16).toString("hex");
      const authorizeUrl = buildAuthorizeUrl(credentials, {
        state,
        codeChallenge: challenge,
      });
      return {
        authorizeUrl,
        hint: "Complete authorization in the browser, then run `postwave login` if tokens are not saved automatically.",
      };
    }
    default:
      throw new Error(`Unknown method: ${method}`);
  }
}

export function startIpcServer(
  ctx: RuntimeContext,
  port: number
): Server {
  const server = createServer(async (req, res) => {
    if (req.method !== "POST") {
      res.writeHead(405);
      res.end();
      return;
    }

    const host = req.headers.host ?? "";
    if (!host.startsWith("127.0.0.1:") && !host.startsWith("localhost:")) {
      res.writeHead(403);
      res.end();
      return;
    }

    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk as Buffer);
    }

    try {
      const body = JSON.parse(Buffer.concat(chunks).toString("utf8")) as {
        jsonrpc?: string;
        id?: string | number;
        method?: string;
        params?: Record<string, unknown>;
      };

      if (body.jsonrpc !== "2.0" || !body.method) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            jsonrpc: "2.0",
            id: body.id ?? null,
            error: { code: -32600, message: "Invalid request" },
          })
        );
        return;
      }

      const result = await handleMethod(ctx, body.method, body.params);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ jsonrpc: "2.0", id: body.id, result }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Internal error";
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          jsonrpc: "2.0",
          id: null,
          error: { code: -32000, message },
        })
      );
    }
  });

  server.listen(port, "127.0.0.1");
  return server;
}
