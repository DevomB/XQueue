import { chmodSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type Database from "better-sqlite3";
import { HeapScheduler } from "./heap-scheduler.js";
import { openDatabase } from "./migrate.js";
import { SqlitePostRepository } from "./repository.js";
import { SqliteTokenStore } from "./token-store.js";

export { BinaryMinHeap, type HeapEntry } from "./heap.js";
export { HeapScheduler } from "./heap-scheduler.js";
export { openDatabase } from "./migrate.js";
export {
  SqlitePostRepository,
  type CreatePostInput,
  type ListPostsOptions,
} from "./repository.js";
export { SqliteTokenStore } from "./token-store.js";

export type SqliteStorage = {
  repo: SqlitePostRepository;
  tokenStore: SqliteTokenStore;
  scheduler: HeapScheduler;
  db: Database.Database;
};

export function createSqliteStorage(dataDir: string): SqliteStorage {
  mkdirSync(dataDir, { recursive: true });

  if (process.platform !== "win32") {
    chmodSync(dataDir, 0o700);
  }

  const dbPath = join(dataDir, "postwave.db");
  const db = openDatabase(dbPath);
  const repo = new SqlitePostRepository(db);
  const tokenStore = new SqliteTokenStore(db);
  const scheduler = new HeapScheduler(repo, db);

  return { repo, tokenStore, scheduler, db };
}
