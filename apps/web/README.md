# PostWave Web App

Next.js 16 dashboard and API for PostWave.

## Development

From the **repository root**:

```bash
pnpm install
docker compose up -d
cp .env.example .env   # fill secrets
pnpm db:push
pnpm dev               # this app on :3000
pnpm dev:worker        # separate terminal
```

## Environment

See root [`.env.example`](../../.env.example) and [docs/SELF_HOST.md](../../docs/SELF_HOST.md).

Required: `DATABASE_URL`, `REDIS_URL`, `AUTH_SECRET`, `TOKEN_ENCRYPTION_KEY`, X API credentials.

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Next.js dev server |
| `pnpm build` | Production build |
| `pnpm test` | Vitest unit tests |
| `pnpm test:e2e` | Playwright smoke tests |

See the [root README](../../README.md) for full project documentation.
