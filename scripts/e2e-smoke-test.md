# E2E Smoke Test Checklist

Run after local or staging deploy with real X API credentials.

## Prerequisites

- [ ] Docker Postgres + Redis running
- [ ] Web app on :3000, worker running
- [ ] `.env` filled with X, AUTH_SECRET, TOKEN_ENCRYPTION_KEY

## Steps

1. **Sign up** at `/signup` with test email
2. **Connect X** in Settings → Connect X account → authorize
3. **Verify** `@username` shows in Settings
4. **Schedule** a text post 2 minutes ahead via Compose or bulk paste:
   ```
   YYYY-MM-DD HH:mm | PostWave smoke test [timestamp]
   ```
5. **Close browser** (worker runs independently)
6. **Wait** 2–3 minutes
7. **Verify:**
   - [ ] Post appears on X
   - [ ] Dashboard shows status `PUBLISHED`
8. **Image post:** Upload JPEG in Compose, schedule 2 min ahead → verify on X
9. **Edit flow:** Edit a draft's text → save → verify in queue
10. **Failure path:** Disconnect X, schedule post → should `FAILED` + email (if Resend configured)

## Automated (Playwright)

```bash
cd apps/web
pnpm exec playwright test
```

Requires `PLAYWRIGHT_BASE_URL` (default `http://localhost:3000`).
