import { randomUUID } from "node:crypto";
import type { PostRepository, PostStatus, ScheduledPost } from "@postwave/core";
import type Database from "better-sqlite3";

export type CreatePostInput = {
  text: string;
  scheduledAt?: Date | null;
  timezone?: string;
  mediaPaths?: string[];
  status?: PostStatus;
};

export type ListPostsOptions = {
  status?: PostStatus;
  limit?: number;
};

type PostRow = {
  id: string;
  text: string;
  scheduled_at: number | null;
  status: PostStatus;
  media_paths: string;
  attempt_count: number;
  last_error: string | null;
  x_tweet_id: string | null;
  published_at: number | null;
  updated_at: number;
};

function rowToPost(row: PostRow): ScheduledPost {
  return {
    id: row.id,
    text: row.text,
    status: row.status,
    mediaPaths: JSON.parse(row.media_paths) as string[],
    scheduledAt: row.scheduled_at == null ? null : new Date(row.scheduled_at),
    updatedAt: new Date(row.updated_at),
    attemptCount: row.attempt_count,
    xTweetId: row.x_tweet_id,
    publishedAt: row.published_at == null ? null : new Date(row.published_at),
    failureReason: row.last_error,
  };
}

const SELECT_POST = `
  SELECT
    id, text, scheduled_at, status, media_paths, attempt_count,
    last_error, x_tweet_id, published_at, updated_at
  FROM scheduled_post
  WHERE id = ?
`;

export class SqlitePostRepository implements PostRepository {
  private readonly findByIdStmt;
  private readonly lockForPublishStmt;
  private readonly markPublishedStmt;
  private readonly markFailedStmt;
  private readonly markScheduledStmt;
  private readonly findDuePostsStmt;
  private readonly findStaleQueuedStmt;
  private readonly recoverToScheduledStmt;
  private readonly insertPostStmt;
  private readonly listPostsStmt;
  private readonly cancelPostStmt;
  private readonly retryPostStmt;
  private readonly updatePostStmt;
  private readonly deletePostStmt;
  private readonly countMissedStmt;
  private readonly findNextScheduledStmt;

  constructor(private readonly db: Database.Database) {
    this.findByIdStmt = db.prepare(SELECT_POST);
    this.lockForPublishStmt = db.prepare(`
      UPDATE scheduled_post
      SET status = 'QUEUED', updated_at = ?
      WHERE id = ? AND status = 'SCHEDULED'
    `);
    this.markPublishedStmt = db.prepare(`
      UPDATE scheduled_post
      SET
        status = 'PUBLISHED',
        x_tweet_id = ?,
        published_at = ?,
        updated_at = ?,
        last_error = NULL
      WHERE id = ?
    `);
    this.markFailedStmt = db.prepare(`
      UPDATE scheduled_post
      SET
        status = 'FAILED',
        last_error = ?,
        attempt_count = attempt_count + 1,
        updated_at = ?
      WHERE id = ?
    `);
    this.markScheduledStmt = db.prepare(`
      UPDATE scheduled_post
      SET status = 'SCHEDULED', updated_at = ?
      WHERE id = ?
    `);
    this.findDuePostsStmt = db.prepare(`
      SELECT
        id, text, scheduled_at, status, media_paths, attempt_count,
        last_error, x_tweet_id, published_at, updated_at
      FROM scheduled_post
      WHERE status = 'SCHEDULED'
        AND scheduled_at IS NOT NULL
        AND scheduled_at <= ?
      ORDER BY scheduled_at ASC
    `);
    this.findStaleQueuedStmt = db.prepare(`
      SELECT
        id, text, scheduled_at, status, media_paths, attempt_count,
        last_error, x_tweet_id, published_at, updated_at
      FROM scheduled_post
      WHERE status = 'QUEUED'
        AND updated_at < ?
      ORDER BY updated_at ASC
    `);
    this.recoverToScheduledStmt = db.prepare(`
      UPDATE scheduled_post
      SET status = 'SCHEDULED', updated_at = ?
      WHERE id = ? AND status = 'QUEUED'
    `);
    this.insertPostStmt = db.prepare(`
      INSERT INTO scheduled_post (
        id, text, scheduled_at, timezone, status, media_paths,
        attempt_count, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
    `);
    this.listPostsStmt = db.prepare(`
      SELECT
        id, text, scheduled_at, status, media_paths, attempt_count,
        last_error, x_tweet_id, published_at, updated_at
      FROM scheduled_post
      WHERE (? IS NULL OR status = ?)
      ORDER BY
        CASE WHEN scheduled_at IS NULL THEN 1 ELSE 0 END,
        scheduled_at ASC,
        updated_at DESC
      LIMIT ?
    `);
    this.cancelPostStmt = db.prepare(`
      UPDATE scheduled_post
      SET status = 'CANCELLED', updated_at = ?
      WHERE id = ? AND status IN ('SCHEDULED', 'FAILED')
    `);
    this.retryPostStmt = db.prepare(`
      UPDATE scheduled_post
      SET
        status = 'SCHEDULED',
        last_error = NULL,
        attempt_count = 0,
        updated_at = ?
      WHERE id = ? AND status = 'FAILED'
    `);
    this.updatePostStmt = db.prepare(`
      UPDATE scheduled_post
      SET
        text = COALESCE(?, text),
        scheduled_at = ?,
        status = COALESCE(?, status),
        media_paths = COALESCE(?, media_paths),
        updated_at = ?
      WHERE id = ?
    `);
    this.deletePostStmt = db.prepare(`DELETE FROM scheduled_post WHERE id = ?`);
    this.countMissedStmt = db.prepare(`
      SELECT COUNT(*) AS count
      FROM scheduled_post
      WHERE status = 'SCHEDULED'
        AND scheduled_at IS NOT NULL
        AND scheduled_at < ?
    `);
    this.findNextScheduledStmt = db.prepare(`
      SELECT
        id, text, scheduled_at, status, media_paths, attempt_count,
        last_error, x_tweet_id, published_at, updated_at
      FROM scheduled_post
      WHERE status = 'SCHEDULED'
        AND scheduled_at IS NOT NULL
      ORDER BY scheduled_at ASC
      LIMIT 1
    `);
  }

  async findById(id: string): Promise<ScheduledPost | null> {
    const row = this.findByIdStmt.get(id) as PostRow | undefined;
    return row ? rowToPost(row) : null;
  }

  async lockForPublish(id: string): Promise<ScheduledPost | null> {
    const now = Date.now();
    const info = this.lockForPublishStmt.run(now, id);
    if (info.changes === 0) {
      return null;
    }
    const row = this.findByIdStmt.get(id) as PostRow | undefined;
    return row ? rowToPost(row) : null;
  }

  async markPublished(id: string, xTweetId: string): Promise<void> {
    const now = Date.now();
    this.markPublishedStmt.run(xTweetId, now, now, id);
  }

  async markFailed(id: string, reason: string): Promise<void> {
    const now = Date.now();
    this.markFailedStmt.run(reason, now, id);
  }

  async markScheduled(id: string): Promise<void> {
    const now = Date.now();
    this.markScheduledStmt.run(now, id);
  }

  async findDuePosts(now: Date): Promise<ScheduledPost[]> {
    const rows = this.findDuePostsStmt.all(now.getTime()) as PostRow[];
    return rows.map(rowToPost);
  }

  async findStaleQueued(threshold: Date): Promise<ScheduledPost[]> {
    const rows = this.findStaleQueuedStmt.all(threshold.getTime()) as PostRow[];
    return rows.map(rowToPost);
  }

  async recoverToScheduled(id: string): Promise<void> {
    const now = Date.now();
    this.recoverToScheduledStmt.run(now, id);
  }

  async create(input: CreatePostInput): Promise<ScheduledPost> {
    const id = randomUUID();
    const now = Date.now();
    const scheduledAt = input.scheduledAt?.getTime() ?? null;
    const timezone = input.timezone ?? "UTC";
    const status = input.status ?? "SCHEDULED";
    const mediaPaths = JSON.stringify(input.mediaPaths ?? []);

    this.insertPostStmt.run(
      id,
      input.text,
      scheduledAt,
      timezone,
      status,
      mediaPaths,
      now,
      now
    );

    const post = await this.findById(id);
    if (!post) {
      throw new Error("Failed to create post");
    }
    return post;
  }

  async list(options: ListPostsOptions = {}): Promise<ScheduledPost[]> {
    const limit = options.limit ?? 50;
    const status = options.status ?? null;
    const rows = this.listPostsStmt.all(status, status, limit) as PostRow[];
    return rows.map(rowToPost);
  }

  async cancel(id: string): Promise<boolean> {
    const info = this.cancelPostStmt.run(Date.now(), id);
    return info.changes > 0;
  }

  async retry(id: string): Promise<boolean> {
    const info = this.retryPostStmt.run(Date.now(), id);
    return info.changes > 0;
  }

  async update(
    id: string,
    input: {
      text?: string;
      scheduledAt?: Date | null;
      status?: PostStatus;
      mediaPaths?: string[];
    }
  ): Promise<ScheduledPost | null> {
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    const scheduledAt =
      input.scheduledAt === undefined
        ? existing.scheduledAt?.getTime() ?? null
        : input.scheduledAt?.getTime() ?? null;
    const mediaPaths =
      input.mediaPaths === undefined
        ? null
        : JSON.stringify(input.mediaPaths);

    this.updatePostStmt.run(
      input.text ?? null,
      scheduledAt,
      input.status ?? null,
      mediaPaths,
      Date.now(),
      id
    );

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const info = this.deletePostStmt.run(id);
    return info.changes > 0;
  }

  async countMissed(now = new Date()): Promise<number> {
    const row = this.countMissedStmt.get(now.getTime()) as { count: number };
    return row.count;
  }

  async findNextScheduled(): Promise<ScheduledPost | null> {
    const row = this.findNextScheduledStmt.get() as PostRow | undefined;
    return row ? rowToPost(row) : null;
  }

  async findMissedPosts(now = new Date()): Promise<ScheduledPost[]> {
    const rows = this.db
      .prepare(
        `
        SELECT
          id, text, scheduled_at, status, media_paths, attempt_count,
          last_error, x_tweet_id, published_at, updated_at
        FROM scheduled_post
        WHERE status = 'SCHEDULED'
          AND scheduled_at IS NOT NULL
          AND scheduled_at < ?
        ORDER BY scheduled_at ASC
      `
      )
      .all(now.getTime()) as PostRow[];
    return rows.map(rowToPost);
  }
}
