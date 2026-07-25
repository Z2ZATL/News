# Z2Zs Lab

Bilingual technology news and analysis for `news.z2zs.space`.

## Local development

1. Copy `.env.example` to `.env.local`.
2. Use `CONTENT_SOURCE=fixture` locally, or configure the private Sanity dataset and server-only viewer token.
3. Run `corepack pnpm install`.
4. Run `corepack pnpm dev`.

Checked-in fixture content is only for local development and CI. Vercel production defaults to Sanity and fails closed when the CMS is not configured.

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

- Public site: Vercel project for `news.z2zs.space`
- Studio: separate Vercel project from the sibling `studio` directory
- Sanity dataset: private
- Preview uses a short-lived, single-use signed ticket. The Studio broker and public site share `PREVIEW_TICKET_SECRET`; the reusable secret never enters a URL.
- Webhook, reaction, rate-limit, Redis, and viewer credentials are server-side Vercel variables only.

Nonce CSP is generated per request in `src/middleware.ts`. Do not replace it with a static CSP or add `unsafe-inline` to `script-src`.
