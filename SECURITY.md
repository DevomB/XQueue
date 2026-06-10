# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| 1.x     | Yes       |

## Reporting a vulnerability

Please open a private security advisory on GitHub or email the maintainer listed in the repository profile. Do not disclose OAuth tokens or `config.json` contents in public issues.

## Operator responsibilities

- Protect `~/.postwave/config.json` and `TOKEN_ENCRYPTION_KEY`
- Use your own X Developer credentials
- Run the marketing site without secrets; daemon binds locally where possible
