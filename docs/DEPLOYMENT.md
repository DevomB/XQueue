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
- `NEXT_PUBLIC_APP_URL` (e.g. `https://app.xqueue.app`)
- `X_CLIENT_ID`, `X_CLIENT_SECRET`, `X_CALLBACK_URL`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID`
- `RESEND_API_KEY`, `EMAIL_FROM`

## Vercel (web)

1. Import repo, set root to `apps/web` or use monorepo config
2. Build command: `cd ../.. && pnpm install && pnpm --filter @xqueue/shared build && pnpm --filter @xqueue/web build`
3. Install command: `pnpm install`
4. Add all env vars
5. Run `pnpm db:push` against production DB once

`vercel.json` is included at repo root.

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

1. Create webhook endpoint: `https://app.xqueue.app/api/stripe/webhook`
2. Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
3. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

## Post-deploy checklist

- [ ] X callback URL updated in Developer Console
- [ ] Worker logs show "XQueue worker started"
- [ ] Schedule test post 2 min ahead → verify publish
- [ ] Stripe test checkout → plan upgrades to PRO
- [ ] Legal pages live at `/terms`, `/privacy`
