import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import pc from "picocolors";
import { readConfig } from "../config.js";
import { exitWithError } from "../util.js";

function repoRoot(): string {
  return path.resolve(process.cwd());
}

export async function runDeployFly(): Promise<void> {
  const root = repoRoot();
  const flyDir = path.join(root, "infra", "deploy", "fly");
  mkdirSync(flyDir, { recursive: true });

  const flyToml = `app = "postwave"
primary_region = "iad"

[build]
  dockerfile = "Dockerfile"

[env]
  POSTWAVE_DATA_DIR = "/data"

[mounts]
  source = "postwave_data"
  destination = "/data"

[[services]]
  internal_port = 8080
  protocol = "tcp"
  auto_stop_machines = false
  auto_start_machines = true
  min_machines_running = 1

  [[services.ports]]
    port = 80
    handlers = ["http"]

[processes]
  app = "postwave daemon"
`;

  const dockerfile = `FROM node:20-slim

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/cli/package.json apps/cli/
COPY packages/core/package.json packages/core/
COPY packages/shared/package.json packages/shared/
COPY packages/storage-sqlite/package.json packages/storage-sqlite/

RUN corepack enable && pnpm install --frozen-lockfile --filter @postwave/cli...
COPY . .
RUN pnpm --filter @postwave/cli build

VOLUME ["/data"]
CMD ["node", "apps/cli/dist/index.js", "daemon"]
`;

  const readme = `# Fly.io deployment

1. Install the [Fly CLI](https://fly.io/docs/hands-on/install-flyctl/)
2. \`fly launch --no-deploy\` from this directory
3. Create a volume: \`fly volumes create postwave_data --size 1\`
4. Set secrets:
   \`\`\`
   fly secrets set \\
     TOKEN_ENCRYPTION_KEY=... \\
     X_CLIENT_ID=... \\
     X_CLIENT_SECRET=...
   \`\`\`
5. \`fly deploy\`
`;

  writeFileSync(path.join(flyDir, "fly.toml"), flyToml);
  writeFileSync(path.join(flyDir, "Dockerfile"), dockerfile);
  writeFileSync(path.join(flyDir, "README.md"), readme);

  console.log(pc.green("Fly.io templates written to infra/deploy/fly/"));
  console.log(pc.dim(`  ${flyDir}`));
}

export async function runDeployDocker(): Promise<void> {
  const config = await readConfig();
  const dataDir = config.dataDir ?? path.join(process.env.HOME ?? "/root", ".postwave", "data");

  console.log(pc.bold("Docker run"));
  console.log();
  console.log(`docker run -d \\
  --name postwave \\
  -v postwave-data:/data \\
  -e POSTWAVE_DATA_DIR=/data \\
  -e TOKEN_ENCRYPTION_KEY=\${TOKEN_ENCRYPTION_KEY} \\
  -e X_CLIENT_ID=\${X_CLIENT_ID} \\
  -e X_CLIENT_SECRET=\${X_CLIENT_SECRET} \\
  postwave/cli:latest \\
  postwave daemon`);

  console.log();
  console.log(pc.bold("docker-compose.yml snippet"));
  console.log();
  console.log(`services:
  postwave:
    image: postwave/cli:latest
    restart: unless-stopped
    volumes:
      - postwave-data:/data
    environment:
      POSTWAVE_DATA_DIR: /data
      TOKEN_ENCRYPTION_KEY: \${TOKEN_ENCRYPTION_KEY}
      X_CLIENT_ID: \${X_CLIENT_ID}
      X_CLIENT_SECRET: \${X_CLIENT_SECRET}
    command: ["postwave", "daemon"]

volumes:
  postwave-data:`);

  console.log();
  console.log(pc.dim(`Local data dir: ${dataDir}`));
}

export async function runDeployCommand(target?: string): Promise<void> {
  if (target === "fly") {
    await runDeployFly();
    return;
  }
  if (target === "docker") {
    await runDeployDocker();
    return;
  }
  exitWithError("Usage: postwave deploy <fly|docker>");
}
