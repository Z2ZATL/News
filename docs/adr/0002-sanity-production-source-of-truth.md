# ADR 0002: Sanity is the production content source of truth

Status: Accepted

## Context

Merging repository articles into every CMS response makes archive and unpublish
operations ineffective. It also creates two editorial lifecycles.

## Decision

Production Articles, Projects, Authors, Categories, and Settings come only from
validated Sanity documents. Repository content may be used by migrations,
development fixtures, and automated tests, but never as an implicit production
fallback.

## Consequences

- Existing repository articles must be migrated before the production adapter
  is switched.
- Missing or invalid CMS configuration fails visibly and safely; it does not
  republish stale local content.
- Tests use an explicit fixture adapter through the Content module interface.
