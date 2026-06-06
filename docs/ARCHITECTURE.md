# PostWave Architecture

## Components

- **apps/web** — Next.js 15 app: marketing, dashboard, REST API, Stripe webhooks, X OAuth
- **apps/worker** — BullMQ consumer: publishes scheduled posts via X API
- **packages/shared** — Plan limits, Zod validators, bulk paste parser

## Data flow

1. User schedules post → API writes `ScheduledPost` to Postgres
2. API enqueues BullMQ job with delay = `scheduledAt - now`
3. Worker picks up job → refreshes OAuth token → `POST /2/tweets`
4. Worker updates status to `PUBLISHED` or `FAILED` (+ email on failure)

## Auth layers

- **PostWave account:** NextAuth credentials (email/password)
- **X connection:** OAuth 2.0 PKCE, tokens encrypted at rest

## External services

- PostgreSQL, Redis, X API, Stripe, Resend
