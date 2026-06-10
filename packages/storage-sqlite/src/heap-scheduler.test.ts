import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSqliteStorage } from "./index.js";

function insertScheduledPost(
  db: ReturnType<typeof createSqliteStorage>["db"],
  id: string,
  scheduledAt: number
): void {
  const now = Date.now();
  db.prepare(`
    INSERT INTO scheduled_post (
      id, text, scheduled_at, timezone, status, media_paths,
      attempt_count, created_at, updated_at
    ) VALUES (?, ?, ?, 'UTC', 'SCHEDULED', '[]', 0, ?, ?)
  `).run(id, `post ${id}`, scheduledAt, now, now);
}

describe("HeapScheduler", () => {
  let dataDir: string;
  let db: ReturnType<typeof createSqliteStorage>["db"] | null = null;

  beforeEach(() => {
    dataDir = mkdtempSync(join(tmpdir(), "postwave-sqlite-"));
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    db?.close();
    db = null;
    rmSync(dataDir, { recursive: true, force: true });
  });

  it("fires due posts and supports cancel before wake", async () => {
    const storage = createSqliteStorage(dataDir);
    db = storage.db;
    const { scheduler } = storage;
    const fired: string[] = [];

    insertScheduledPost(db, "due", Date.now() + 1000);
    insertScheduledPost(db, "cancelled", Date.now() + 1000);

    scheduler.start((postId) => {
      fired.push(postId);
    });
    scheduler.cancel("cancelled");

    expect(scheduler.nextRunAt()?.getTime()).toBe(Date.now() + 1000);

    await vi.advanceTimersByTimeAsync(1000);

    expect(fired).toEqual(["due"]);
    scheduler.stop();
  });

  it("rebuilds the heap from the database after restart", () => {
    const first = createSqliteStorage(dataDir);
    db = first.db;
    insertScheduledPost(first.db, "persisted", Date.now() + 5000);
    first.scheduler.schedule("persisted", new Date(Date.now() + 5000));
    expect(first.scheduler.nextRunAt()?.getTime()).toBe(Date.now() + 5000);
    first.db.close();
    db = null;

    const restarted = createSqliteStorage(dataDir);
    db = restarted.db;
    restarted.scheduler.rebuildHeapFromDb();

    expect(restarted.scheduler.nextRunAt()?.getTime()).toBe(Date.now() + 5000);
  });

  it("recovers stale queued posts back into the schedule", async () => {
    const storage = createSqliteStorage(dataDir);
    db = storage.db;
    const { scheduler, repo } = storage;
    const now = Date.now();
    const staleUpdatedAt = now - 11 * 60 * 1000;

    db.prepare(`
      INSERT INTO scheduled_post (
        id, text, scheduled_at, timezone, status, media_paths,
        attempt_count, created_at, updated_at
      ) VALUES (?, ?, ?, 'UTC', 'QUEUED', '[]', 0, ?, ?)
    `).run("stale", "stale post", now + 2000, staleUpdatedAt, staleUpdatedAt);

    const recovered = await scheduler.recoverStaleQueued();
    expect(recovered).toBe(1);

    const post = await repo.findById("stale");
    expect(post?.status).toBe("SCHEDULED");
    expect(scheduler.nextRunAt()?.getTime()).toBe(now + 2000);

    scheduler.stop();
  });
});
