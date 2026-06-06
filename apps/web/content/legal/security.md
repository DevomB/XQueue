# Security

## Data Protection

- **OAuth tokens:** Encrypted at rest with AES-256-GCM using a server-side key (`TOKEN_ENCRYPTION_KEY`).
- **Passwords:** bcrypt with cost factor 12.
- **Transport:** TLS 1.2+ for all connections.

## Authentication

- XQueue accounts use email/password with secure session cookies.
- X connection uses OAuth 2.0 PKCE with `state` CSRF protection.
- Dashboard routes require authentication.

## Infrastructure

- Database: PostgreSQL with row-level user isolation.
- Job queue: Redis with authenticated connections in production.
- Stripe webhooks verified with HMAC signatures.

## Incident Response

Report security issues to Devom.b@yahoo.com. We aim to respond within 72 hours.

## Account Deletion

Deleting your account removes scheduled posts, encrypted tokens, and cancels active Stripe subscriptions.
