# @postwave/storage-sqlite

SQLite-backed persistence and in-process scheduling for PostWave. Single-user storage with encrypted X tokens and a min-heap scheduler.

## Usage

```typescript
import { createSqliteStorage } from "@postwave/storage-sqlite";

const { repo, tokenStore, scheduler, db } = createSqliteStorage("~/.postwave");

scheduler.schedule(postId, new Date("2026-06-10T12:00:00Z"));
scheduler.start(async (postId) => {
  // publish via @postwave/core
});
```

On Unix, `createSqliteStorage` creates the data directory with mode `0700`.

## Complexity

| Operation | Structure | Time |
|-----------|-----------|------|
| Schedule / cancel (heap) | Binary min-heap + tombstone set | O(log n) push; O(1) cancel mark |
| Next due post | Heap root | O(1) peek |
| Pop due posts | Heap pop | O(log n) per post |
| Tombstone compaction | Rebuild live entries | O(n) when tombstones > n/2 |
| `findById`, status updates | SQLite B-tree (primary key) | O(log n) |
| `findDuePosts`, `findStaleQueued` | Indexed `(status, scheduled_at)` / `(status, updated_at)` | O(k + log n) |
| `rebuildHeapFromDb` | Full index scan of scheduled rows | O(n) |

The scheduler wakes with a single `setTimeout` aligned to the heap minimum, then drains all posts with `scheduledAt <= now` in one wake cycle.

WAL mode, foreign keys, and a 5s busy timeout are enabled at open time. All repository and token paths use prepared statements.
