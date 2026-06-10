# PostWave

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Queue and schedule X posts in bulk. Paste a batch, set the times, and let the daemon publish via the official X API.

**Open source.** Run locally with the CLI or desktop app, or deploy the daemon to your own cloud. No hosted service — your keys, your data.

## Three ways to run

| Surface | For |
|---------|-----|
| **CLI** (`postwave`) | Developers, scripts, headless servers |
| **Desktop** | Tray app with queue, compose, and settings |
| **Deploy daemon** | 24/7 publishing on Docker, Fly.io, or Railway |

## Quick start (CLI)

```bash
git clone https://github.com/DevomB/X-Post-Creator.git
cd X-Post-Creator
pnpm install
pnpm --filter @postwave/cli build

# Install globally from the repo, or use node apps/cli/dist/index.js
node apps/cli/dist/index.js init
node apps/cli/dist/index.js login
node apps/cli/dist/index.js daemon
```

Configure X API credentials in `~/.postwave/config.json`. See [docs/X_DEVELOPER_SETUP.md](docs/X_DEVELOPER_SETUP.md).

## Development

```bash
pnpm install
pnpm dev              # marketing site
pnpm dev:cli          # CLI watch
pnpm dev:desktop      # desktop UI (Vite)
pnpm dev:worker       # deploy daemon
pnpm build:all
pnpm test
```

## Project structure

```
apps/cli/              postwave CLI + background daemon
apps/desktop/          Vite + React UI (Tauri shell ready)
apps/web/              Marketing site only
apps/worker/           Deploy daemon for Docker/Fly/Railway
packages/core/         Publish engine, OAuth, encryption
packages/storage-sqlite/  SQLite + min-heap scheduler
packages/shared/       Validators, bulk paste parser
infra/deploy/          Docker, Fly, Railway templates
docs/                  Install, deployment, architecture
```

## Deploy (always-on)

```bash
docker compose --profile deploy up -d
# or
postwave deploy fly
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) and [docs/INSTALL.md](docs/INSTALL.md).

## Disclaimer

Software provided **AS IS** without warranty. You operate your own instance and are responsible for your X API usage, scheduled content, and infrastructure. See [DISCLAIMER.md](DISCLAIMER.md).

## License

[MIT](LICENSE) — not affiliated with X Corp.
