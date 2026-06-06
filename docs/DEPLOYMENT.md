# Deployment Guide

## Overview

| Component | Platform | Notes |
|-----------|----------|-------|
| Web app | Vercel | `apps/web` |
| Worker | Railway or Fly.io | `apps/worker` — must run 24/7 |
| PostgreSQL | Neon or Supabase | Connection string → `DATABASE_URL` |
| Redis | Upstash | Connection string → `REDIS_URL` |

## Environment variables (production)

Copy all variables from `.env.example`. Required for production:

- `DATABASE_URL`, `REDIS_URL`
- `AUTH_SECRET`, `TOKEN_ENCRYPTION_KEY`
- `NEXT_PUBLIC_APP_URL` (e.g. `https://postwave.social`)
- `X_CLIENT_ID`, `X_CLIENT_SECRET`, `X_CALLBACK_URL`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID`
- `RESEND_API_KEY`, `EMAIL_FROM`

## Vercel (web)

1. Import repo from GitHub
2. **Root Directory:** `apps/web` (Project Settings → General) — **required**. If this is left as `.` (repo root), the build finishes in ~1 second, deploys nothing, and every URL returns `404: NOT_FOUND`.
3. **Include source files outside Root Directory:** enable (needed for `@postwave/shared` workspace package)
4. **Output Directory:** leave empty (defaults to `.next`). Do **not** set `apps/web/.next` — that doubles the path and breaks deploys.
5. Build/install commands are in [`apps/web/vercel.json`](apps/web/vercel.json) — no dashboard overrides needed unless you prefer manual entry:
   - Install: `cd ../.. && pnpm install`
   - Build: `cd ../.. && pnpm --filter @postwave/shared build && pnpm --filter @postwave/web build`
6. Add all env vars from `.env.example`
7. Run `pnpm db:push` against production DB once

## Railway (worker)

1. Create service from `apps/worker`
2. Start command: `pnpm start`
3. Share same `DATABASE_URL`, `REDIS_URL`, `TOKEN_ENCRYPTION_KEY`, X credentials
4. Set `NEXT_PUBLIC_APP_URL` for failure email links

`railway.toml` is included.

## Fly.io (worker alternative)

```bash
cd apps/worker
fly launch
fly secrets set DATABASE_URL=... REDIS_URL=... TOKEN_ENCRYPTION_KEY=...
fly deploy
```

`fly.toml` is included.

## Stripe webhooks

1. Create webhook endpoint: `https://postwave.social/api/stripe/webhook`
2. Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
3. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

## Post-deploy checklist

- [ ] X callback URL updated in Developer Console
- [ ] Worker logs show "PostWave worker started"
- [ ] Schedule test post 2 min ahead → verify publish
- [ ] Stripe test checkout → plan upgrades to PRO
- [ ] Legal pages live at `/terms`, `/privacy`
