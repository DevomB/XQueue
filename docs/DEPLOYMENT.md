# Deployment Guide (Bring Your Own Cloud)

PostWave is designed to run on **your** infrastructure. You are the operator — not a hosted SaaS customer.

## Overview

| Component | Options |
|-----------|---------|
| Web app | Vercel, Docker, AWS ECS |
| Worker | Railway, Fly.io, AWS ECS (must run 24/7) |
| PostgreSQL | Neon, Supabase, RDS, Docker |
| Redis | Upstash, ElastiCache, Docker |

## Environment variables

Copy from [`.env.example`](../.env.example). All secrets stay in **your** accounts.

**Critical for production:**
- Generate fresh `AUTH_SECRET` and `TOKEN_ENCRYPTION_KEY` — never reuse dev keys
- Set `NEXT_PUBLIC_APP_URL` to your public URL
- Update X Developer Console callback URL
- Use `STORAGE_TYPE=s3` if web runs on serverless (Vercel)

## Vercel (web only)

1. Import repo; set **Root Directory** to `apps/web`
2. Enable "Include source files outside Root Directory" for `@postwave/shared`
3. Build commands are in `apps/web/vercel.json`
4. Run `pnpm db:push` against production Postgres once
5. Deploy worker separately (Railway/Fly/AWS) — Vercel cannot run the BullMQ worker

## Railway / Fly.io (worker)

See [`railway.toml`](../railway.toml) and [`apps/worker/fly.toml`](../apps/worker/fly.toml).

Worker needs: `DATABASE_URL`, `REDIS_URL`, `TOKEN_ENCRYPTION_KEY`, X credentials, `NEXT_PUBLIC_APP_URL`.

## S3 image storage (production)

When `STORAGE_TYPE=s3`:

1. Create a bucket (or use Terraform in `infra/deploy/aws/` — S3 only today).
2. Set `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, and `S3_PUBLIC_URL` (base URL workers use to fetch images).
3. Configure bucket CORS if the web app uploads from the browser:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedOrigins": ["https://your-app.example.com"],
    "ExposeHeaders": []
  }
]
```

4. Ensure the worker can `GET` uploaded objects at the URLs stored in `mediaUrls`.

## AWS (partial Terraform)

Terraform in [`infra/deploy/aws/`](../infra/deploy/aws/README.md) currently creates an **S3 uploads bucket** only. RDS, ElastiCache, and ECS are planned — deploy Postgres/Redis via Neon, Upstash, or Docker until then.

## One-command Docker (optional)

```bash
docker compose --profile full up -d   # postgres + redis + web + worker
```

Requires `.env` configured. Default `docker compose up -d` starts Postgres and Redis only.

## Post-deploy checklist

- [ ] X callback URL updated in Developer Console
- [ ] Worker logs show "PostWave worker started"
- [ ] Schedule test post 2 min ahead → verify publish
- [ ] Image upload works (S3 if on Vercel)

## Liability

You deploy and operate this software. See [DISCLAIMER.md](../DISCLAIMER.md).
