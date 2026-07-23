# Z2Zs Lab

Bilingual technology news and analysis for `news.z2zs.space`.

## Local development

1. Copy `.env.example` to `.env.local`.
2. Add a private Sanity dataset and a server-only viewer token when the CMS is ready.
3. Run `corepack pnpm install`.
4. Run `corepack pnpm dev`.

Without Sanity credentials, the launch article is served from the checked-in fallback content.

## Required checks

```text
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm build
```

## Deployment

- Public site: Vercel project for `news.z2zs.space`
- Studio: separate Vercel project from the sibling `studio` directory
- Sanity dataset: private
- Preview, webhook, and viewer secrets: server-side Vercel variables only

Nonce CSP is generated per request in `src/middleware.ts`. Do not replace it with a static CSP or add `unsafe-inline` to `script-src`.
