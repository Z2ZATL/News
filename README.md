# Z2Zs Lab

Bilingual technology news and analysis for `news.z2zs.space`.

## Local development

1. Copy `.env.example` to `.env.local`.
2. Use `CONTENT_SOURCE=fixture` locally, or set the public Sanity project ID and
   dataset. A server-only viewer token is required only for draft preview.
3. Run `corepack pnpm install`.
4. Run `corepack pnpm dev`.

Checked-in fixture content is only for local development and CI. A production
deployment defaults to Sanity and fails closed when the CMS is not configured.

## Required checks

```text
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm test:unit
corepack pnpm build
corepack pnpm test:e2e
corepack pnpm test:lighthouse
```

## Deployment

- Public site: Netlify Free site for `news.z2zs.space`
- Studio: separate Netlify Free site from the sibling `studio` directory
- The Netlify sites are intentionally not linked to the private organization
  repository. CI runs on GitHub; reviewed commits are released with the manual
  `Deploy Netlify` workflow, which invokes the authenticated CLI on Linux and
  stays within the Free plan.
- Sanity dataset: public Free-plan `production`; never store secrets or
  confidential personal data in editorial documents
- Preview uses a short-lived, single-use signed ticket. The Studio broker and public site share `PREVIEW_TICKET_SECRET`; the reusable secret never enters a URL.
- Webhook, reaction, rate-limit, Redis, and viewer credentials are server-side
  host variables only.
- Keep both Netlify sites on the Free plan with the hard credit limit. Do not
  enable auto recharge, paid analytics, image CDN transforms, scheduled jobs,
  or repository-linked automatic deploys. Build reviewed releases locally and
  deploy deliberately through the authenticated CLI.

Nonce CSP is generated per request in `src/middleware.ts`. Do not replace it with a static CSP or add `unsafe-inline` to `script-src`.
