# Z2Zs Lab — Agent Instructions

## Source of truth

Apply instructions in this order: the latest explicit user instruction, this
file, accepted ADRs, then the implementation. Inspect the code and current
environment before reporting status.

## Project state

- The repository is public and has no active production deployment.
- Former `news.z2zs.space` and `studio.z2zs.space` infrastructure is retired.
- Never recreate hosting, DNS, databases, webhooks, tokens, or paid services
  without explicit user authorization.
- Local development uses fixture content by default and must not require an
  external account.
- Package manager: pnpm with committed lockfiles and frozen installs in CI.

## Product requirements

- Default locale is Thai; `/` redirects to `/th`.
- Support user-selectable dark and light themes.
- Preserve editorial typography, deliberate whitespace, and natural Thai copy.
- Motion must not hijack scrolling, flash, autoplay audio, or obstruct reading.
- Respect `prefers-reduced-motion`.

## Orbiting Atlas

The DOM is the product; WebGL is progressive decoration. Server-render real
links and semantic content, keep canvas content `aria-hidden`, and preserve a
complete 2D fallback for no JavaScript, no WebGL, reduced motion, low-power
devices, and WebGL context loss.

## Content and internationalization

- Published content requires complete Thai and English fields and cover alt text.
- Slugs must match `^[a-z0-9-]{1,120}$`.
- External sources use HTTPS; raw HTML is prohibited.
- Format server dates in `Asia/Bangkok`; use Gregorian years and Arabic numerals.
- Keep Thai body line height at least `1.6` and set correct `lang` attributes.
- Canonicals point to the current locale; provide `th`, `en`, and `x-default`.
- Do not redirect based on `Accept-Language`.

## Security invariants

- Keep the nonce-based public CSP unless the user explicitly changes it.
- Do not add `unsafe-eval` or broad script `unsafe-inline`.
- Never prefix secrets with `NEXT_PUBLIC_`.
- Parameterize GROQ queries and validate all API input with allowlists.
- Verify webhook signatures against the raw body.
- Keep security cookies host-only and sanitize Portable Text links.
- Do not commit `.env` files, tokens, private keys, service credentials, or
  provider project identifiers.
- Moderate-or-higher dependency audit findings block release.

## Repository rules

- Preserve strict TypeScript and zero-warning ESLint gates.
- Do not use `@ts-ignore`; avoid `any`.
- Never stage unrelated user changes.
- Do not add provider-specific deployment workflows or production domains
  without an accepted ADR and explicit authorization.

## Required validation

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test:unit
pnpm scan:secrets
pnpm build
pnpm audit --audit-level=moderate
```

Run Playwright, axe, Lighthouse, reduced-motion, no-JS, WebGL fallback, and
console-warning checks when the affected surface requires them. Never claim a
gate passed unless it was run successfully against the current source.
