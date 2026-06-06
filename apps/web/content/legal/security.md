# Security

## Data Protection

- **OAuth tokens:** Encrypted at rest with strong, industry-standard authenticated encryption. Keys are held server-side and never exposed to the client.
- **Passwords:** Stored only as salted, computationally hard hashes — we never keep your plaintext password.
- **Transport:** All connections are encrypted with modern TLS.

## Authentication

- PostWave accounts use email/password with secure, signed session cookies.
- Connecting your X account uses OAuth with PKCE and CSRF protection — we never see or store your X password.
- All dashboard and account routes require authentication.

## Account Isolation

- Your posts, drafts, and tokens are isolated per account — your data is never visible to other users.
- Scheduled jobs and webhooks are verified before they're trusted.

## Incident Response

Report security issues to Devom.b@yahoo.com. We aim to respond within 72 hours.

## Account Deletion

Deleting your account removes your scheduled posts, encrypted tokens, and cancels any active subscription.
