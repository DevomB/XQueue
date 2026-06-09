FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

RUN pnpm install --frozen-lockfile || pnpm install
RUN pnpm --filter @postwave/shared build
RUN pnpm --filter @postwave/web build

WORKDIR /app/apps/web
EXPOSE 3000
CMD ["pnpm", "start"]
