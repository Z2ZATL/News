# ADR 0003: Reactions are aggregated server-side

Status: Accepted

## Context

Browser local storage cannot produce a site-wide ranking or enforce consistent
reaction changes across devices and sessions.

## Decision

The public site exposes a small Reaction module interface backed by an atomic
Redis-compatible adapter in production and an in-memory adapter in tests.
Anonymous visitor identity uses a signed, host-only cookie. No account, email,
or full IP address is stored. Per-visitor selections expire with the one-year
visitor cookie; aggregate counters remain available for ranking.

## Consequences

- Atlas rankings consume aggregate Reaction module results.
- The article remains readable if reaction storage is unavailable.
- Mutation routes require application and platform rate limits.
