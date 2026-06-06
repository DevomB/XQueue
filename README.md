# XQueue

Queue and schedule X posts in bulk. Paste a batch of posts, set the times, close your browser — XQueue publishes via the official X API.

## Stack

- **Web:** Next.js 15, NextAuth, Prisma, Tailwind
- **Worker:** BullMQ + Redis (scheduled publishing)
- **Payments:** Stripe ($15/mo Pro)
- **Shared:** Zod validators, plan limits, bulk paste parser

## Quick start

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (for local Postgres + Redis)

### 1. Clone and install

```bash
pnpm install
```

### 2. Environment

```bash
cp .env.example .env
# Fill in required values (see docs/X_DEVELOPER_SETUP.md for X API)
```

Generate secrets:

```bash
openssl rand -base64 32   # AUTH_SECRET
openssl rand -base64 32   # TOKEN_ENCRYPTION_KEY
```

### 3. Start infrastructure

```bash
docker compose up -d
```

### 4. Database

```bash
pnpm db:push
```

### 5. Run

```bash
# Terminal 1 — web app
pnpm dev

# Terminal 2 — publish worker
pnpm dev:worker
```

Open [http://localhost:3000](http://localhost:3000).

## Plans

| Feature | Free | Pro ($15/mo) |
|---------|------|--------------|
| Text posts/month | 10 | 150 |
| Image posts | No | Yes (4/post) |
| Link posts/month | 0 | 30 |

## Project structure

```
apps/web/          Next.js app (marketing + dashboard + API)
apps/worker/       BullMQ worker for scheduled publishing
packages/shared/   Plan limits, validators, bulk paste parser
docs/legal/        Terms, Privacy, Acceptable Use, Security
```

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## X Developer setup

See [docs/X_DEVELOPER_SETUP.md](docs/X_DEVELOPER_SETUP.md).

## Legal

Not legal advice. Review [docs/legal/](docs/legal/) with an attorney before charging customers.

## License

Proprietary — all rights reserved.
