# Indie Hackers Post

**Title:** XQueue — Schedule X posts in bulk (browser closed, official API)

**Body:**

Hey IH — I shipped XQueue this week.

**The idea:** Paste a batch of X posts with times, and a server-side worker publishes them via the official X API. Your browser can be closed.

**Stack:** Next.js, BullMQ, Postgres, Redis, Stripe, X OAuth 2.0 PKCE.

**Pricing:**
- Free: 10 text posts/month
- Pro: $15/mo — 150 posts, images, 30 link posts

**Why not a Chrome extension?** DOM automation violates X ToS and fails when the tab is closed. Server-side scheduling is the reliable path.

Looking for beta users who batch content. Link in comments.

**Ask:** What's your current X scheduling workflow?
