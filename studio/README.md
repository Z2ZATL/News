# Z2Zs Labs Studio

Sanity Studio for the private Z2Zs Labs dataset. This is a separate deployment from the public site so Studio dependencies and its relaxed runtime policy never affect `news.z2zs.space`.

## Setup

1. Authenticate the Sanity CLI.
2. Create or choose the private dataset.
3. Copy `.env.example` to `.env.local` and set the project ID, dataset, preview secret, and preview origin.
4. Run `corepack pnpm typecheck`.
5. Run `corepack pnpm build`.
6. Deploy this directory as a separate Vercel project for `studio.z2zs.space`.

Enable Vercel password protection and restrict Sanity CORS to `https://news.z2zs.space` and `https://studio.z2zs.space`.
