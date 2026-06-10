# ADR 002: Remove multi-tenant web dashboard

## Status

Accepted

## Context

The Next.js dashboard required Postgres, Redis, NextAuth, and operator liability for hosted deployments.

## Decision

Remove the dashboard and API from `apps/web`. Ship CLI, desktop UI, and deploy daemon as the product surfaces. Keep `apps/web` as a static marketing site.

## Consequences

- No hosted user accounts or token storage on the marketing host
- Users run software locally or on their own cloud
- Simpler security model for open-source distribution
