# Changelog

## [1.0.0] - 2026-06-10

### Added

- `@postwave/core` publish engine with OAuth, encryption, and local media storage
- `@postwave/storage-sqlite` with min-heap scheduler
- `postwave` CLI: init, login, add, import, list, daemon, deploy helpers
- Desktop app (`apps/desktop`) with queue, compose, and settings UI
- Deploy daemon (`apps/worker`) for Docker, Fly.io, and Railway
- Marketing site refresh with CLI / desktop / deploy positioning

### Removed

- Multi-tenant web dashboard, NextAuth, PostgreSQL, Redis, and BullMQ from default path
- Hosted SaaS-shaped API routes from `apps/web`

### Changed

- Local-first architecture: SQLite + in-process scheduling
- `apps/web` is marketing-only
