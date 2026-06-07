# Optional Demo Deployment

If you host a public demo instance (e.g. Vercel + Railway), add a visible banner:

> **Demo instance** — for trying PostWave only. [Self-host for production](docs/SELF_HOST.md) · [Disclaimer](DISCLAIMER.md)

Recommended:
- Separate X Developer app with limited credentials
- Rate limiting enabled (`RATE_LIMIT_ENABLED=true`)
- Do not use for production scheduling
- Clear disclaimer on landing page footer

This keeps liability with users who self-host rather than with you as a platform operator.
