FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/shared ./packages/shared
COPY apps/web/prisma ./apps/web/prisma
COPY apps/worker ./apps/worker

RUN pnpm install --frozen-lockfile || pnpm install
RUN pnpm --filter @postwave/shared build
RUN pnpm --filter @postwave/worker build

WORKDIR /app/apps/worker
CMD ["node", "dist/index.js"]
