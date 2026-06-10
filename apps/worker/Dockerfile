FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* .npmrc* ./
COPY packages/shared ./packages/shared
COPY packages/core ./packages/core
COPY packages/storage-sqlite ./packages/storage-sqlite
COPY apps/worker ./apps/worker

RUN pnpm install --frozen-lockfile || pnpm install
RUN pnpm --filter @postwave/shared build
RUN pnpm --filter @postwave/core build
RUN pnpm --filter @postwave/storage-sqlite build
RUN pnpm --filter @postwave/worker build

ENV POSTWAVE_DATA_DIR=/data
VOLUME /data
WORKDIR /app/apps/worker
EXPOSE 8081
CMD ["node", "dist/index.js"]
