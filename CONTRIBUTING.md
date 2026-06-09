# Contributing to PostWave

## Development setup

1. Install Node.js 20+, pnpm 9+, and Docker.
2. Clone the repo and run `pnpm install`.
3. Start Postgres and Redis: `docker compose up -d`
4. Copy `.env.example` to `.env` and fill in secrets.
5. Apply schema: `pnpm db:push`
6. Run web: `pnpm dev` (port 3000)
7. Run worker in a second terminal: `pnpm dev:worker`

## Commands

| Command | Description |
|---------|-------------|
| `pnpm lint` | Lint all packages |
| `pnpm test` | Unit tests (web, shared, worker) |
| `pnpm build` | Production build |
| `pnpm --filter @postwave/web test:e2e` | Playwright smoke tests |

## Pull requests

- Keep changes focused and match existing code style.
- Run `pnpm lint` and `pnpm test` before opening a PR.
- Update docs when changing env vars, APIs, or deploy steps.
