# E2E Smoke Test Checklist

Run after local or staging deploy with real X API credentials.

## Prerequisites

- [ ] Docker Postgres + Redis running
- [ ] Web app on :3000, worker running
- [ ] `.env` filled with X, AUTH_SECRET, TOKEN_ENCRYPTION_KEY

## Steps

1. **Sign up** at `/signup` with test email; accept Terms checkbox
2. **Connect X** in Settings → Connect X account → authorize
3. **Verify** `@username` shows in Settings
4. **Schedule** a post 2 minutes ahead via Compose or bulk paste:
   ```
   YYYY-MM-DD HH:mm | PostWave smoke test [timestamp]
   ```
5. **Close browser** (or open incognito — worker is independent)
6. **Wait** 2–3 minutes
7. **Verify:**
   - [ ] Post appears on X
   - [ ] Dashboard shows status `PUBLISHED`
   - [ ] Usage meter incremented
8. **Failure path:** Disconnect X, schedule post → should `FAILED` + email (if Resend configured)

## Automated helper

```bash
# After scheduling, poll API (requires session cookie or test token)
curl http://localhost:3000/api/posts -H "Cookie: ..."
```

Record results in your deploy notes.
