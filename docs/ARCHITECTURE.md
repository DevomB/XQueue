# PostWave Architecture

## Overview

PostWave is a **local-first** X post scheduler with one shared engine and three distribution surfaces:

| Surface | Package | Role |
|---------|---------|------|
| CLI | `apps/cli` | Commands, OAuth login, foreground daemon |
| Desktop | `apps/desktop` | React UI over IPC (Tauri-ready) |
| Deploy | `apps/worker` | Always-on daemon for Docker/Fly/Railway |
| Marketing | `apps/web` | Public site only |

## Engine

```
packages/shared     Validators, bulk paste, constants (client-safe)
packages/core       Publish, OAuth, encryption, config
packages/storage-sqlite   SQLite persistence + min-heap scheduler
```

### Scheduler

Scheduled posts are stored in SQLite with index `(status, scheduled_at)`. An in-memory **min-heap** orders publish times:

- Schedule: O(log n) push
- Next run: O(1) peek
- Cancel: tombstone + optional compaction

On daemon start, the heap is rebuilt from `SCHEDULED` rows ordered by `scheduled_at`.

### Publish flow

1. User schedules post → SQLite row `SCHEDULED`
2. Heap scheduler fires at `scheduled_at`
3. Publisher locks row → `QUEUED`, refreshes OAuth token if needed
4. Upload local media → `POST /2/tweets`
5. Row → `PUBLISHED` or `FAILED` (optional email)

Stale `QUEUED` rows (worker crash) are recovered on an interval.

## Data

Single-user SQLite at `~/.postwave/data/` (or `POSTWAVE_DATA_DIR`). X tokens encrypted at rest (AES-256-GCM).

## IPC (desktop ↔ daemon)

JSON-RPC 2.0 over HTTP when `POSTWAVE_IPC_PORT` is set. See `docs/ipc-protocol.md`.

```mermaid
flowchart LR
  Desktop[apps/desktop] -->|IPC| Daemon[postwave daemon]
  CLI[apps/cli] --> Daemon
  Daemon --> Core[@postwave/core]
  Core --> SQLite[(SQLite)]
  Core --> XAPI[X API v2]
```
