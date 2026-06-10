import type { PostRepository, Scheduler } from "@postwave/core";
import { QUEUED_STALE_THRESHOLD_MS } from "@postwave/shared";
import type Database from "better-sqlite3";
import { BinaryMinHeap } from "./heap.js";

type DueHandler = (postId: string) => void | Promise<void>;

export class HeapScheduler implements Scheduler {
  private heap = new BinaryMinHeap();
  private readonly listScheduledStmt;
  private running = false;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private onDuePost: DueHandler | null = null;
  private cachedNextRunAt: Date | null = null;
  private draining = false;

  constructor(
    private readonly repo: PostRepository,
    db: Database.Database
  ) {
    this.listScheduledStmt = db.prepare(`
      SELECT id, scheduled_at
      FROM scheduled_post
      WHERE status = 'SCHEDULED'
        AND scheduled_at IS NOT NULL
      ORDER BY scheduled_at ASC
    `);
  }

  schedule(postId: string, at: Date): void {
    this.heap.remove(postId);
    this.heap.push({ postId, scheduledAt: at.getTime() });
    this.armTimer();
  }

  cancel(postId: string): void {
    this.heap.remove(postId);
    this.armTimer();
  }

  nextRunAt(): Date | null {
    return this.cachedNextRunAt;
  }

  rebuildHeapFromDb(): void {
    this.heap = new BinaryMinHeap();
    const rows = this.listScheduledStmt.all() as Array<{
      id: string;
      scheduled_at: number;
    }>;
    for (const row of rows) {
      this.heap.push({ postId: row.id, scheduledAt: row.scheduled_at });
    }
    this.armTimer();
  }

  async recoverStaleQueued(): Promise<number> {
    const threshold = new Date(Date.now() - QUEUED_STALE_THRESHOLD_MS);
    const stale = await this.repo.findStaleQueued(threshold);

    for (const post of stale) {
      await this.repo.recoverToScheduled(post.id);
      if (post.scheduledAt) {
        this.schedule(post.id, post.scheduledAt);
      }
    }

    return stale.length;
  }

  start(onDuePost: DueHandler): void {
    if (this.running) {
      return;
    }

    this.running = true;
    this.onDuePost = onDuePost;
    this.rebuildHeapFromDb();
    void this.recoverStaleQueued().then(() => {
      this.armTimer();
    });
  }

  stop(): void {
    this.running = false;
    this.onDuePost = null;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.cachedNextRunAt = null;
  }

  private armTimer(): void {
    if (!this.running) {
      this.refreshNextRunCache();
      return;
    }

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    const next = this.heap.peek();
    if (!next) {
      this.cachedNextRunAt = null;
      return;
    }

    this.cachedNextRunAt = new Date(next.scheduledAt);
    const delay = Math.max(0, next.scheduledAt - Date.now());
    this.timer = setTimeout(() => {
      void this.drainDue();
    }, delay);
  }

  private refreshNextRunCache(): void {
    const next = this.heap.peek();
    this.cachedNextRunAt = next ? new Date(next.scheduledAt) : null;
  }

  private async drainDue(): Promise<void> {
    if (!this.running || this.draining) {
      return;
    }

    this.draining = true;
    try {
      const now = Date.now();
      const handler = this.onDuePost;
      if (!handler) {
        return;
      }

      while (true) {
        const top = this.heap.peek();
        if (!top || top.scheduledAt > now) {
          break;
        }

        const entry = this.heap.pop();
        if (!entry) {
          break;
        }

        await handler(entry.postId);
      }
    } finally {
      this.draining = false;
      this.armTimer();
    }
  }
}
