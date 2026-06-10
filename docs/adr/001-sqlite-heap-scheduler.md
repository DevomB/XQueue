# ADR 001: SQLite with in-process min-heap scheduler

## Status

Accepted

## Context

PostWave is single-user local-first software. The previous stack (PostgreSQL, Redis, BullMQ) suited multi-tenant SaaS but added operational cost for CLI and desktop users.

## Decision

Use **SQLite** for persistence and an **in-process min-heap** keyed by `scheduled_at` for scheduling. Deploy daemons use the same stack with a volume-mounted data directory.

## Consequences

- No Redis or Postgres required for default installs
- Schedule insert O(log n); peek next run O(1)
- Daemon must stay running (or use deploy surface) for timed publishes
- Heap rebuilt from DB on restart — durable and simple
