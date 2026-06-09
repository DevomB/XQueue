# Changelog

## Unreleased

### Added

- QUEUED post recovery cron and stale-lock handling in worker
- DLQ consumer marking failed posts
- Password reset flow (forgot/reset pages + API)
- Post preview, toast notifications, confirm dialogs
- Queue search, sort, calendar view, export, duplicate
- Signed URLs for local image uploads
- Health endpoints (`/api/health`, worker `WORKER_HEALTH_PORT`)
- Expanded Playwright smoke tests and CI e2e job

### Changed

- Atomic post create + BullMQ enqueue with rollback on Redis failure
- Marketing landing: TweetCard, Marquee, Counter, interactive bulk paste
- Documentation aligned with OSS self-host model (billing removed)

## 2026-06-06 — OSS pivot

- Removed Stripe billing (`UsageCounter`, plan fields) via migration `20260606120000_remove_billing`
- PostWave is fully open source under MIT

## 2026-06-05 — Initial release

- Core scheduler: auth, X OAuth, bulk paste, compose, BullMQ worker
