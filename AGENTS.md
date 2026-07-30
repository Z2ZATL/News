# Z2Zs Lab News — Agent Instructions

This file is the repository-level operating contract for agents working on Z2Zs Lab News.

## Source of truth

Apply instructions in this order:

1. The latest explicit user instruction.
2. This `AGENTS.md`.
3. Accepted ADRs and domain documentation.
4. Accepted Build Plan v4 remediation decisions recorded under `docs/adr/`.
5. The Z2Zs Lab Build Plan v3 where it does not conflict with an accepted ADR.
6. Existing implementation details.

The latest user decision overrides Build Plan v3 on CSP: the public site uses a **nonce-based CSP**. Do not revert it to a static `script-src 'self'` policy unless the user explicitly changes that decision.

Do not treat a target in the build plan as already implemented. Inspect the source, deployment, DNS, or service configuration before reporting its status.

## Project

- Product: bilingual technology news and analysis site with an experimental Orbiting Atlas.
- Canonical public domain: `https://news.z2zs.space` with no `www`.
- Default language: Thai. `/` redirects to `/th`.
- Public application: Next.js 15 App Router, React, strict TypeScript, Tailwind and CSS Modules.
- CMS: Sanity Studio under `studio/`, deployed separately to `https://studio.z2zs.space`.
- Hosting: separate Netlify Free sites for the public site and Studio. The
  production cutover is complete; Vercel configuration and local project links
  have been retired from this repository.
- Netlify sites remain unlinked from the private organization repository.
  Releases use the authenticated CLI from the manually dispatched Linux
  workflow in `.github/workflows/deploy-netlify.yml`. This avoids paid private
  repository integration and the Netlify OpenNext symlink failure on Windows.
- Repository: private GitHub repository `Z2ZATL/News`.
- Package manager: pnpm with committed lockfiles and frozen installs in CI.

The apex `z2zs.space` is reserved for the Z2Zs corporate site and email. Never redirect it to the news site.

## Product and design

- Support user-selectable dark and light themes. Dark remains the default when no preference is stored.
- Use the Z2Zs palette: `#2FBFF2`, `#0090D0`, near-black surfaces, and white.
- Preserve an editorial rhythm: large Thai and English typography, deliberate whitespace, strong hierarchy, and natural human copy.
- Avoid generic AI-dashboard visuals and generic AI-generated wording.
- Thai copy should be direct, graceful, and grounded in what was tested or verified.
- Motion may add depth, glow, parallax, hover, and route transitions, but must never hijack scrolling, flash, autoplay audio, or obstruct reading.
- Respect `prefers-reduced-motion`; the site must remain fully usable without animation.

## Orbiting Atlas

The DOM is the product; WebGL is progressive decoration.

- Server-render the semantic DOM layer and real links.
- Keep canvas content `aria-hidden`.
- Load 3D only on the client and preserve a complete 2D editorial fallback.
- The page must remain readable with JavaScript disabled, WebGL unavailable, low-power mode active, or a lost WebGL context.
- Keyboard navigation and screen-reader semantics operate on DOM elements, never on canvas hit targets alone.

## Content and internationalization

- Every published article requires complete Thai and English title, excerpt, body, and cover alt text.
- Article slugs are shared across languages and must match `^[a-z0-9-]{1,120}$`.
- External source URLs must use HTTPS.
- Raw HTML and unreviewed embeds are prohibited in editorial content.
- Use Gregorian years and Arabic numerals in both languages.
- Format server dates with the `Asia/Bangkok` timezone.
- Set correct `lang` attributes. Do not insert zero-width spaces into Thai prose as a default line-breaking strategy.
- Keep Thai body text at a line height of at least `1.6`.
- Canonicals point to the current language page. Provide `th`, `en`, and `x-default` hreflang values, with `/th` as `x-default`.
- Do not redirect based on `Accept-Language`.

Editorial workflow: `draft → review → published → archived`.

## Rendering and integration

- The nonce-based CSP requires per-request HTML. Public HTML is dynamic and must
  not be described or tested as ISR. Sanity data reads may still use Next cache
  tags and the signed webhook for data invalidation.
- Sanity is the only production source of truth for editorial articles, projects,
  authors, categories, and settings. Repository content files are fixtures or
  migration inputs only and must never silently republish archived CMS content.
- Sanity GROQ queries must always be parameterized.
- Published reads may use the CDN. The accepted zero-cost baseline uses a public
  Sanity dataset: unauthenticated reads must select only published records, while
  draft preview requires a server-only viewer token and an authenticated editor.
- Search remains a client-side filter over a prefetched index in v1. Do not add a public search API without a new decision.
- Presentation/iframe preview remains disabled in v1. Draft preview opens in a new tab.
- API routes must validate input with allowlists and return deliberate error statuses.

## Security invariants

Security boundaries are product requirements, not optional cleanup.

- Public-site CSP is nonce-based. Generate a fresh cryptographically random nonce per response and apply it only to trusted scripts.
- Keep `default-src 'none'`, `frame-ancestors 'none'`, `base-uri 'none'`, and `object-src 'none'`.
- Do not add `'unsafe-eval'` or broad `'unsafe-inline'` to the public-site script policy.
- Runtime CSS-in-JS is prohibited on the public site. Use Tailwind and CSS Modules.
- The audited JSON-LD helper may serialize structured data through a nonce-authorized script. Do not use `dangerouslySetInnerHTML` for editorial or user-controlled HTML.
- Keep the public site and Sanity Studio on separate origins. Never relax the public CSP to accommodate Studio.
- Published Sanity production data is public under the Free plan. Never store
  secrets or confidential personal data in editorial documents. Preview and
  webhook secrets remain server-only, and draft preview remains authenticated.
- Never prefix secrets, tokens, or private keys with `NEXT_PUBLIC_`.
- Validate webhook signatures against the exact raw request body.
- Draft-mode secrets use timing-safe comparison, and redirects use allowlisted locale and slug values only.
- Draft cookies stay host-only. Never set `Domain=.z2zs.space`; custom security-sensitive cookies should use the `__Host-` prefix.
- Sanitize Portable Text links and allow only approved protocols. External links use `noopener noreferrer`; apply `nofollow ugc` where content is user-controlled.
- Image hosts are allowlisted. SVG rendering remains disabled unless separately reviewed.
- Do not commit `.env` files, tokens, `.vercel`, private keys, or service credentials.
- Dependency audit findings at moderate severity or above block release.

Required public-site headers include HSTS for one year without `includeSubDomains` or `preload`, `nosniff`, `DENY`, a strict referrer policy, restrictive permissions policy, COOP, CORP, and the accepted COEP policy.

## Domain and infrastructure safety

DNS is managed in Cloudflare; registration and transfer controls are managed in
Newfold. `news.z2zs.space` and `studio.z2zs.space` remain DNS-only while pointing
to Netlify so the application host owns caching and TLS.

The zone contains unrelated production services and email records. Do not delete, replace, proxy, or broadly edit DNS records.

Protected records and services include:

- `brief.z2zs.space`
- `preview.brief.z2zs.space`
- apex Google Workspace MX records
- `clk._domainkey.brief`, `clk2._domainkey.brief`, and `clkmail.brief`

Never place null MX, `v=spf1 -all`, or wildcard DKIM revocation at the apex. Do not move DMARC directly to reject. Roll it out from monitoring only after SPF and DKIM alignment is verified for every legitimate sender.

Application hostnames that use CNAME records cannot also carry MX or SPF TXT
records at the same owner name. Follow ADR 0005: use explicit DMARC records
under `_dmarc.news` and `_dmarc.studio` after exact approval, while keeping the
apex policy in monitoring until every legitimate sender is verified.

Never enable HSTS preload or `includeSubDomains` at the apex. Recovery email for domain-control accounts must use a different domain.

When decommissioning a subdomain, remove its DNS record before deleting the corresponding hosted project to avoid a dangling CNAME.

Any DNS, registrar, email-authentication, access-control, secret-rotation, production deletion, or domain-transfer action requires an exact read-only target check and explicit user authorization.

## Repository and supply chain

- Use the private GitHub repository and GitHub Issues described in `docs/agents/issue-tracker.md`.
- Use the default triage mapping in `docs/agents/triage-labels.md`.
- Read `CONTEXT.md` and relevant ADRs according to `docs/agents/domain.md` when they exist.
- Preserve pnpm lockfiles and use `pnpm install --frozen-lockfile` in CI.
- Do not disable type, lint, or build errors.
- Do not use `@ts-ignore`. A justified `@ts-expect-error` is permitted only when unavoidable.
- Avoid `any`; keep strict TypeScript settings enabled.
- Never stage unrelated user changes.
- Work through a branch and pull request for normal changes. On GitHub Free,
  apply CI, signed-commit, review, and local guardrails even when protected-branch
  enforcement is unavailable for the private repository. Never claim that a
  server-side rule is active without verifying it.
- Keep production on zero-cost service tiers. Never start trials, paid add-ons,
  metered overages, or upgrades without explicit founder authorization. Do not
  treat Vercel Hobby as a compliant permanent host for commercial promotion.
  ADR 0004 records the accepted Netlify Free migration; the approved DNS
  cutover is complete.
- A Netlify draft deploy may be created for validation through the manual
  deployment workflow. Its production path requires the exact confirmation
  phrase. Never attach a custom domain until the corresponding release and DNS
  mutations are explicitly approved.
- Deploy to production only when the user has requested or approved a production release.

## Required validation

Run the narrowest useful checks while developing, then run the full relevant gate before handoff:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm build
pnpm audit --audit-level=moderate
```

When the relevant test infrastructure exists, also require:

- Playwright coverage for affected routes and interactions.
- No `console.error` or `console.warn` on tested routes.
- axe-core with zero violations.
- Lighthouse targets: performance at least 95, accessibility 100, best practices 100, and SEO 100.
- Keyboard-only navigation without focus traps.
- Reduced-motion, JavaScript-disabled, WebGL-disabled, and WebGL-context-loss checks for Atlas changes.
- Thai mobile line-breaking checks.
- Secret scanning of source and emitted client assets.

Do not claim a gate passed unless it was run successfully against the current source state.

## Agent skills

### Issue tracker

Issues and PRDs are tracked in GitHub Issues for `Z2ZATL/News`. See `docs/agents/issue-tracker.md`.

### Triage labels

The repository uses the five default Matt Pocock triage labels. See `docs/agents/triage-labels.md`.

### Domain docs

This repository uses a single-context domain documentation layout. See `docs/agents/domain.md`.
