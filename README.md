# Z2Zs Lab

Open-source bilingual technology news and analysis site with an experimental
3D Orbiting Atlas. The application is built with Next.js 15, strict TypeScript,
React Three Fiber, and an optional Sanity CMS.

This repository has no active production deployment, domain, webhook,
database, or service token. Hosting is intentionally provider-neutral.

## Local development

1. Install Node.js 22 and enable Corepack.
2. Copy `.env.example` to `.env.local`.
3. Keep `CONTENT_SOURCE=fixture` to run without any external account.
4. Install and start the site:

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

Open `http://localhost:3000`. The root route redirects to `/th`.

## Optional Sanity CMS

The checked-in fixture content is enough for local development and CI. To use
your own Sanity project, create a project and dataset, then supply your own
project ID and credentials in local environment files. Do not commit tokens.

The Studio is a separate workspace:

```bash
cd studio
copy .env.example .env.local
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

## Quality gates

```bash
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm test:unit
corepack pnpm scan:secrets
corepack pnpm build
corepack pnpm test:e2e
corepack pnpm test:lighthouse
corepack pnpm audit --audit-level=moderate
```

## Security

Production credentials must remain server-only. Copy the example environment
files and generate new random values for every deployment. Never reuse secrets
from the former Z2Zs Lab deployment.

Please report vulnerabilities through a private GitHub Security Advisory rather
than a public issue.

## License

- Software, configuration, documentation, and original interface artwork:
  [MIT](LICENSE)
- Original editorial articles: [CC BY 4.0](CONTENT-LICENSE.md)
- Third-party Earth textures: MIT; see
  [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)

Copyright licenses do not grant permission to imply endorsement by Z2Zs Lab or
to misuse its names as trademarks. The complete path-based scope is documented
in [CONTENT-LICENSE.md](CONTENT-LICENSE.md).
