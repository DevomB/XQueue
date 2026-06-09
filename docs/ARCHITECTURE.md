# PostWave Architecture

## Components

- **apps/web** — Next.js 16 app: landing page, dashboard, REST API, X OAuth
- **apps/worker** — BullMQ consumer: publishes scheduled posts via X API v2
- **packages/shared** — Zod validators, bulk paste parser, shared constants

## Data flow

1. User schedules post → API writes `ScheduledPost` to Postgres
2. API enqueues BullMQ job with delay = `scheduledAt - now`
3. Worker picks up job → refreshes OAuth token if needed → `POST /2/tweets`
4. Worker updates status to `PUBLISHED` or `FAILED` (+ email on failure via Resend)

## Post status lifecycle

`DRAFT` → `SCHEDULED` → `QUEUED` (worker lock) → `PUBLISHED` | `FAILED` | `CANCELLED`

- **QUEUED recovery:** If a worker crashes mid-publish, a cron resets stale `QUEUED` posts (default 10 min) back to `SCHEDULED` and re-enqueues.
- **Dead-letter queue:** After BullMQ max retries, jobs land in `publish-post-dlq`; a DLQ worker marks posts `FAILED` with the error reason.

## Media URL reachability

The worker fetches `mediaUrls` at publish time. In production:

- **S3:** Use a bucket URL the worker can reach (public object or presigned GET). Configure CORS if needed.
- **Local storage:** Signed URLs (`/api/uploads/{file}?sig=...`) must be reachable from the worker process at `NEXT_PUBLIC_APP_URL`.

## Auth layers

- **PostWave account:** NextAuth credentials (email/password, bcrypt)
- **X connection:** OAuth 2.0 PKCE, tokens encrypted at rest (AES-256-GCM)

## External services

- PostgreSQL, Redis, X API v2
- Resend (optional — failure alert emails)

## Storage

- `STORAGE_TYPE=local` — image uploads to disk (Docker / local dev)
- `STORAGE_TYPE=s3` — S3-compatible storage for cloud deploys
