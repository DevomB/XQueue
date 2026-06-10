# PostWave CLI

Self-hosted command-line tool for scheduling and publishing posts to X.

## Install

From the monorepo root:

```bash
pnpm install
pnpm --filter @postwave/cli build
pnpm --filter @postwave/cli link --global
```

Or run without linking:

```bash
node apps/cli/dist/index.js <command>
```

## Quick start

```bash
postwave init
# Edit ~/.postwave/config.json with X OAuth credentials
postwave login
postwave add --text "Hello world" --at "2026-06-15T12:00:00Z"
postwave daemon
```

## Commands

| Command | Description |
|---------|-------------|
| `postwave init` | Create `~/.postwave`, `config.json`, and SQLite database |
| `postwave login` | Connect X account via OAuth PKCE (local callback server) |
| `postwave status` | X username, next post, missed count, daemon PID |
| `postwave add --text <t> [--at <iso>] [--media <files...>]` | Schedule a single post |
| `postwave import [file]` | Bulk import from file or stdin (`-` for stdin) |
| `postwave list [--status <s>] [--limit <n>] [--json]` | List posts |
| `postwave cancel <id>` | Cancel a scheduled or failed post |
| `postwave retry <id>` | Retry a failed post |
| `postwave daemon` | Run scheduler in foreground (writes PID file) |
| `postwave daemon install` | Write systemd user unit or Windows Task XML |
| `postwave catch-up [--yes]` | Publish missed scheduled posts |
| `postwave deploy fly` | Write Fly.io templates to `infra/deploy/fly/` |
| `postwave deploy docker` | Print `docker run` and compose snippets |
| `postwave --version` | Show CLI version |
| `postwave --help` | Show help |

### Bulk import format

One post per line. Optional schedule prefix:

```
2026-06-15 09:00 | Morning post text
Draft without a schedule
```

Use `--timezone America/New_York` when dates are in a local timezone.

### Configuration

Config file: `~/.postwave/config.json`

Environment overrides: `POSTWAVE_CONFIG_PATH`, `POSTWAVE_DATA_DIR`, `TOKEN_ENCRYPTION_KEY`, `X_CLIENT_ID`, `X_CLIENT_SECRET`, `X_CALLBACK_URL`, `NOTIFY_EMAIL`, `RESEND_API_KEY`, `EMAIL_FROM`.

### Daemon

The daemon runs in the foreground, writes `daemon.pid` under the data directory, and stops cleanly on `SIGINT` / `SIGTERM`.

```bash
postwave daemon install   # systemd (Linux) or Task Scheduler XML (Windows)
postwave daemon
```

## Development

```bash
pnpm --filter @postwave/cli test
pnpm --filter @postwave/cli build
```
