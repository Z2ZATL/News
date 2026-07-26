# ADR 0001: Nonce CSP uses dynamic HTML

Status: Accepted

## Context

The public site requires a fresh nonce on trusted scripts for every response.
An earlier plan also required statically cached ISR HTML. A response-specific
nonce and shared static HTML are incompatible without weakening the policy or
introducing unsafe nonce reuse.

## Decision

Public HTML is rendered per request. Sanity data may be cached and invalidated
with Next cache tags, but the HTML response is not called or tested as ISR.
Static assets and optimized images remain cacheable.

## Consequences

- `Cache-Control: private, no-store` on HTML is expected.
- Performance budgets are met through small server output, cached data, static
  assets, and progressive loading rather than shared HTML caching.
- A future move back to ISR requires a separate ADR and a CSP design that does
  not reuse response nonces.
