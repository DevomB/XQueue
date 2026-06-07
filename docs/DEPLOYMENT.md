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

## AWS (full stack)

Terraform template in [`infra/deploy/aws/`](../infra/deploy/aws/README.md) deploys into **your AWS account**:
- RDS PostgreSQL
- ElastiCache Redis
- ECS Fargate (web + worker)
- S3 for image uploads

## Post-deploy checklist

- [ ] X callback URL updated in Developer Console
- [ ] Worker logs show "PostWave worker started"
- [ ] Schedule test post 2 min ahead → verify publish
- [ ] Image upload works (S3 if on Vercel)

## Liability

You deploy and operate this software. See [DISCLAIMER.md](../DISCLAIMER.md).
