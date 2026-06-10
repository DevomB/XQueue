# Install PostWave

PostWave ships as a CLI, desktop app, or deployable daemon. All surfaces share the same engine and store data in `~/.postwave/`.

## Prerequisites

- Node.js 20+
- X Developer account with OAuth 2.0 app ([setup guide](X_DEVELOPER_SETUP.md))

## CLI

```bash
npm install -g postwave
# or from source:
pnpm --filter @postwave/cli build
```

```bash
postwave init
postwave login
postwave add --text "Hello world" --at "2026-06-15T14:00:00Z"
postwave daemon
```

### systemd (Linux)

```bash
postwave daemon install
systemctl --user enable --now postwave.service
```

### Windows Task Scheduler

```bash
postwave daemon install
# Follow printed schtasks command
```

## Desktop

Download the latest release from GitHub Releases, or run from source:

```bash
pnpm dev:desktop
```

With the CLI daemon and IPC:

```bash
POSTWAVE_IPC_PORT=9847 postwave daemon
POSTWAVE_IPC_PORT=9847 pnpm dev:desktop
```

## Deploy daemon (24/7)

```bash
postwave deploy docker   # prints docker compose command
postwave deploy fly      # generates Fly.io config
```

Or use `docker compose --profile deploy up -d` from the repo root.

Health check: `GET http://localhost:8081/health`

## Configuration

`~/.postwave/config.json`:

```json
{
  "tokenEncryptionKey": "<openssl rand -base64 32>",
  "x": {
    "clientId": "...",
    "clientSecret": "...",
    "callbackUrl": "http://127.0.0.1:8787/callback"
  },
  "timezone": "America/New_York"
}
```

Environment variables override file values. See [`.env.example`](../.env.example).
