# PostWave

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Queue and schedule X posts in bulk. Paste a batch, set the times, close your browser — PostWave publishes via the official X API.

**Open source.** Self-host on Docker or deploy to your own AWS account. No paywalls.

## Features

- Bulk paste import (`YYYY-MM-DD HH:mm | text`)
- Single-post compose with drafts
- Timezone-aware scheduling
- Image posts (up to 4 per post)
- Edit, cancel, retry failed posts
- Official X OAuth 2.0 + API v2
- BullMQ worker for reliable background publishing

## Stack

| Layer | Tech |
|-------|------|
| Web | Next.js 16, React 19, NextAuth, Prisma, Tailwind 4 |
| Worker | BullMQ + Redis |
| Database | PostgreSQL 16 |
| Shared | Zod validators, bulk paste parser |

## Quick start

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (Postgres + Redis)

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USER/X-Post-Creator.git
cd X-Post-Creator
pnpm install
```

### 2. Environment

```bash
cp .env.example .env
# Fill in AUTH_SECRET, TOKEN_ENCRYPTION_KEY, X API credentials
```

Generate secrets:

```bash
openssl rand -base64 32   # AUTH_SECRET
openssl rand -base64 32   # TOKEN_ENCRYPTION_KEY
```

### 3. Start infrastructure

```bash
docker compose up -d
pnpm db:push
```

### 4. Run

```bash
# Terminal 1 — web app
pnpm dev

# Terminal 2 — publish worker
pnpm dev:worker
```

Open [http://localhost:3000](http://localhost:3000).

See [docs/SELF_HOST.md](docs/SELF_HOST.md) for the full guide and [docs/X_DEVELOPER_SETUP.md](docs/X_DEVELOPER_SETUP.md) for X API setup.

## Project structure

```
apps/web/          Next.js app (landing + dashboard + API)
apps/worker/       BullMQ worker for scheduled publishing
packages/shared/   Validators, bulk paste parser, constants
infra/deploy/      AWS Terraform template
docs/              Self-host, deployment, architecture guides
```

## Deploy

| Target | Guide |
|--------|-------|
| Docker Compose | [docs/SELF_HOST.md](docs/SELF_HOST.md) |
| AWS (your account) | [infra/deploy/aws/README.md](infra/deploy/aws/README.md) |
| Railway / Fly.io | [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) |

## Disclaimer

Software provided **AS IS** without warranty. You operate your own instance and are responsible for your X API usage, scheduled content, and infrastructure. See [DISCLAIMER.md](DISCLAIMER.md).

## License

[MIT](LICENSE) — not affiliated with X Corp.

## Showcase

Sample posts for GitHub/X: [docs/SHOWCASE.md](docs/SHOWCASE.md)

<!-- Screenshot: add docs/screenshot.png when available -->
