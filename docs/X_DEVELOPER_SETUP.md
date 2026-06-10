# X Developer App Setup

Complete these steps before PostWave can publish posts.

## 1. Create a developer account

1. Go to [developer.x.com](https://developer.x.com)
2. Sign in and accept the **Developer Agreement** and **Developer Policy**
3. Describe your use case: *"User-authorized tweet scheduling tool"*

## 2. Create an app

1. Open the Developer Console → **Projects & Apps** → Create app
2. Enable **OAuth 2.0**
3. Set app permissions: **Read and write**
4. Set callback URLs:
   - `http://127.0.0.1:8787/callback` (CLI / desktop login)
   - `postwave://oauth/callback` (desktop deep link, when using Tauri)

## 3. OAuth 2.0 settings

- **Type:** Web App
- **Scopes:** `tweet.read`, `tweet.write`, `users.read`, `offline.access`
- Copy **Client ID** and **Client Secret** to `.env`:

```
X_CLIENT_ID=your_client_id
X_CLIENT_SECRET=your_client_secret
X_CALLBACK_URL=http://127.0.0.1:8787/callback
```

## 4. API credits

1. Purchase API credits in the Developer Console (pay-per-use)
2. Set a **monthly spending cap** to control costs
3. Text posts: ~$0.015/post | Link posts: ~$0.20/post

## 5. Verify

1. Start the app and worker
2. Sign up → Settings → **Connect X account**
3. Authorize and confirm `@username` appears

## Compliance reminders

- Only post content users explicitly queue
- No auto-replies, follows, or likes
- Honor X Automation Rules and rate limits
- Do not claim official partnership with X
