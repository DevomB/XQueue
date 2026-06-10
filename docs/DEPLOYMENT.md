# Deployment Guide

PostWave deploy daemon runs on **your** infrastructure. You are the operator.

## Docker

```bash
cp .env.example .env
# Fill TOKEN_ENCRYPTION_KEY, X_CLIENT_ID, X_CLIENT_SECRET

docker compose --profile deploy up -d
curl http://localhost:8081/health
```

Data persists in the `postwave_data` volume at `/data`.

## Fly.io

```bash
postwave deploy fly
# or copy infra/deploy/fly/worker.toml and set secrets
```

Requires a persistent volume mounted at `/data`.

## Railway

Use `infra/deploy/railway/worker.toml` as reference. Set `POSTWAVE_DATA_DIR` and X credentials in Railway variables.

## Environment

| Variable | Required |
|----------|----------|
| `POSTWAVE_DATA_DIR` | Yes (e.g. `/data`) |
| `TOKEN_ENCRYPTION_KEY` | Yes |
| `X_CLIENT_ID` | Yes |
| `X_CLIENT_SECRET` | Yes |
| `WORKER_HEALTH_PORT` | No (default 8081) |

## Post-deploy

- [ ] X callback URL matches your OAuth app (loopback for CLI; deploy uses env only)
- [ ] Health endpoint returns `ok`
- [ ] Schedule test post 2 minutes ahead and verify publish

See [DISCLAIMER.md](../DISCLAIMER.md).
