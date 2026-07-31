# Z2Zs Lab Studio

Optional Sanity Studio workspace for managing bilingual articles, projects,
authors, categories, and site settings.

No Sanity project is bundled or connected. Create your own project, copy
`.env.example` to `.env.local`, and set `SANITY_STUDIO_PROJECT_ID` before
starting the Studio.

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

The preview broker settings are optional and default to local development
origins. Any hosted preview implementation must authenticate editors, keep
tokens out of URLs, and restrict destination origins.
