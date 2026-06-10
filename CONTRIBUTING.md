# Contributing

## Monorepo layout

| Package | Purpose |
|---------|---------|
| `packages/shared` | Validators, bulk paste (client-safe) |
| `packages/core` | Publish engine, OAuth, config |
| `packages/storage-sqlite` | SQLite + heap scheduler |
| `apps/cli` | `postwave` CLI and daemon |
| `apps/desktop` | React UI |
| `apps/worker` | Deploy daemon |
| `apps/web` | Marketing site |

## Development

```bash
pnpm install
pnpm build:all
pnpm test
pnpm lint
```

Run surfaces individually: `pnpm dev`, `pnpm dev:cli`, `pnpm dev:desktop`, `pnpm dev:worker`.

## Pull requests

- Keep changes focused
- Run `pnpm test` and `pnpm lint` before opening a PR
- No secrets in commits
