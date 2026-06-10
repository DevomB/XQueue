/**
 * Desktop IPC layer for PostWave.
 *
 * When `POSTWAVE_IPC_PORT` (or `VITE_POSTWAVE_IPC_PORT`) is set, calls are sent
 * as JSON-RPC 2.0 over HTTP to `http://127.0.0.1:<port>`. Start the CLI daemon
 * with that port exposed before running the desktop UI in dev.
 *
 * Otherwise an in-memory mock is used (empty queue/settings) so the UI can be
 * developed without a backend. Mutations persist for the browser session only.
 */

import { isLinkPost } from "@postwave/shared";

export type XAccount = {
  id: string;
  username: string;
  connectedAt?: string;
};

export type PostItem = {
  id: string;
  text: string;
  scheduledAt: string | null;
  status: string;
  failureReason: string | null;
  isLinkPost: boolean;
  mediaUrls: string[];
  xTweetId: string | null;
  publishedAt: string | null;
};

export type SettingsData = {
  timezone: string;
  xAccounts: XAccount[];
};

export type CreatePostInput = {
  text: string;
  scheduledAt?: string;
  timezone?: string;
  mediaUrls?: string[];
  status?: "DRAFT" | "SCHEDULED";
  xAccountId?: string;
};

export type BulkPostInput = {
  text: string;
  scheduledAt?: string;
  isDraft?: boolean;
  mediaUrls?: string[];
};

export type UpdatePostInput = {
  text?: string;
  scheduledAt?: string | null;
  status?: "DRAFT" | "SCHEDULED" | "CANCELLED";
  mediaUrls?: string[];
};

export type IpcError = {
  error: string;
};

export interface PostwaveIpc {
  getSettings(): Promise<SettingsData>;
  updateSettings(data: { timezone: string }): Promise<{ timezone: string }>;
  listPosts(): Promise<PostItem[]>;
  createPost(input: CreatePostInput): Promise<PostItem>;
  bulkCreatePosts(
    posts: BulkPostInput[],
    timezone?: string
  ): Promise<PostItem[]>;
  updatePost(id: string, input: UpdatePostInput): Promise<PostItem>;
  deletePost(id: string): Promise<void>;
  retryPost(id: string): Promise<PostItem>;
  uploadImage(file: File): Promise<string>;
  disconnectXAccount(xAccountId: string): Promise<void>;
  getXAuthorizeUrl(): Promise<string>;
}

function ipcPort(): string | undefined {
  return import.meta.env.POSTWAVE_IPC_PORT ?? import.meta.env.VITE_POSTWAVE_IPC_PORT;
}

function rpcBaseUrl(): string | null {
  const port = ipcPort();
  if (!port) return null;
  return `http://127.0.0.1:${port}`;
}

class RpcError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RpcError";
  }
}

async function rpcCall<T>(method: string, params?: unknown): Promise<T> {
  const base = rpcBaseUrl();
  if (!base) {
    throw new Error("RPC transport not configured");
  }

  const res = await fetch(base, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: crypto.randomUUID(), method, params }),
  });

  const payload = (await res.json()) as {
    result?: T;
    error?: { message: string };
  };

  if (!res.ok || payload.error) {
    throw new RpcError(payload.error?.message ?? `RPC ${method} failed`);
  }

  return payload.result as T;
}

function newId(): string {
  return crypto.randomUUID();
}

function createMockIpc(): PostwaveIpc {
  let timezone = "UTC";
  const xAccounts: XAccount[] = [];
  const posts: PostItem[] = [];

  function toPost(
    input: CreatePostInput & { id?: string }
  ): PostItem {
    const id = input.id ?? newId();
    return {
      id,
      text: input.text,
      scheduledAt: input.scheduledAt ?? null,
      status: input.status ?? (input.scheduledAt ? "SCHEDULED" : "DRAFT"),
      failureReason: null,
      isLinkPost: isLinkPost(input.text),
      mediaUrls: input.mediaUrls ?? [],
      xTweetId: null,
      publishedAt: null,
    };
  }

  return {
    async getSettings() {
      return { timezone, xAccounts: [...xAccounts] };
    },

    async updateSettings(data) {
      timezone = data.timezone;
      return { timezone };
    },

    async listPosts() {
      return [...posts];
    },

    async createPost(input) {
      const post = toPost(input);
      posts.push(post);
      return post;
    },

    async bulkCreatePosts(items, tz) {
      if (tz) timezone = tz;
      const created = items.map((item) =>
        toPost({
          text: item.text,
          scheduledAt: item.scheduledAt,
          status: item.isDraft || !item.scheduledAt ? "DRAFT" : "SCHEDULED",
          mediaUrls: item.mediaUrls,
          timezone,
        })
      );
      posts.push(...created);
      return created;
    },

    async updatePost(id, input) {
      const idx = posts.findIndex((p) => p.id === id);
      if (idx === -1) throw new RpcError("Not found");

      const current = posts[idx];
      const text = input.text ?? current.text;
      const scheduledAt =
        input.scheduledAt === null
          ? null
          : input.scheduledAt !== undefined
            ? input.scheduledAt
            : current.scheduledAt;
      const status = input.status ?? current.status;

      posts[idx] = {
        ...current,
        text,
        scheduledAt,
        status,
        mediaUrls: input.mediaUrls ?? current.mediaUrls,
        isLinkPost: isLinkPost(text),
        failureReason: status === "CANCELLED" ? null : current.failureReason,
      };
      return posts[idx];
    },

    async deletePost(id) {
      const idx = posts.findIndex((p) => p.id === id);
      if (idx === -1) throw new RpcError("Not found");
      posts.splice(idx, 1);
    },

    async retryPost(id) {
      const idx = posts.findIndex((p) => p.id === id);
      if (idx === -1) throw new RpcError("Not found");
      const scheduledAt = new Date(Date.now() + 60_000).toISOString();
      posts[idx] = {
        ...posts[idx],
        status: "SCHEDULED",
        scheduledAt,
        failureReason: null,
      };
      return posts[idx];
    },

    async uploadImage(file) {
      return URL.createObjectURL(file);
    },

    async disconnectXAccount(xAccountId) {
      const idx = xAccounts.findIndex((a) => a.id === xAccountId);
      if (idx === -1) throw new RpcError("Not found");
      xAccounts.splice(idx, 1);
    },

    async getXAuthorizeUrl() {
      return "postwave://x/authorize";
    },
  };
}

function createRpcIpc(): PostwaveIpc {
  return {
    getSettings: async () => rpcCall("postwave.getSettings"),
    updateSettings: (data) => rpcCall("postwave.updateSettings", data),
    listPosts: async () => {
      const result = await rpcCall<{ posts: PostItem[] }>("postwave.listPosts");
      return result.posts;
    },
    createPost: async (input) => {
      const result = await rpcCall<{ post: PostItem }>("postwave.schedulePost", {
        text: input.text,
        scheduledAt: input.scheduledAt,
        timezone: input.timezone,
        mediaPaths: input.mediaUrls,
        status: input.status,
      });
      return result.post;
    },
    bulkCreatePosts: async (posts, timezone) => {
      const result = await rpcCall<{ posts: PostItem[] }>(
        "postwave.bulkCreatePosts",
        { posts, timezone }
      );
      return result.posts;
    },
    updatePost: async (id, input) => {
      const result = await rpcCall<{ post: PostItem }>("postwave.updatePost", {
        id,
        ...input,
        mediaPaths: input.mediaUrls,
      });
      return result.post;
    },
    deletePost: async (id) => {
      await rpcCall("postwave.deletePost", { id });
    },
    retryPost: async (id) => {
      const result = await rpcCall<{ post: PostItem }>("postwave.retryPost", {
        id,
      });
      return result.post;
    },
    uploadImage: async (file) => {
      const buffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(buffer).reduce((s, b) => s + String.fromCharCode(b), "")
      );
      const result = await rpcCall<{ path: string }>("postwave.uploadImage", {
        filename: file.name,
        mimeType: file.type,
        data: base64,
      });
      return result.path;
    },
    disconnectXAccount: async (_xAccountId) => {
      await rpcCall("postwave.disconnectX");
    },
    getXAuthorizeUrl: async () => {
      const result = await rpcCall<{ authorizeUrl: string }>("postwave.connectX");
      return result.authorizeUrl;
    },
  };
}

const backend: PostwaveIpc = rpcBaseUrl() ? createRpcIpc() : createMockIpc();

export const ipc: PostwaveIpc = backend;

export function isIpcConnected(): boolean {
  return rpcBaseUrl() !== null;
}

export async function ipcSafe<T>(
  fn: () => Promise<T>
): Promise<{ data: T } | { error: string }> {
  try {
    const data = await fn();
    return { data };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Request failed",
    };
  }
}
