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

## Auth layers

- **PostWave account:** NextAuth credentials (email/password, bcrypt)
- **X connection:** OAuth 2.0 PKCE, tokens encrypted at rest (AES-256-GCM)

## External services

- PostgreSQL, Redis, X API v2
- Resend (optional — failure alert emails)

## Storage

- `STORAGE_TYPE=local` — image uploads to disk (Docker / local dev)
- `STORAGE_TYPE=s3` — S3-compatible storage for cloud deploys
