# Z2Zs Lab Studio

Sanity Studio for the public Free-plan Z2Zs Lab dataset. This is a separate
deployment from the public site so Studio dependencies and its relaxed runtime
policy never affect `news.z2zs.space`. Drafts require Sanity authentication and
do not appear to unauthenticated API clients.

## Setup

1. Authenticate the Sanity CLI.
2. Use project `kbore3rf` and the public `production` dataset.
3. Copy `.env.example` to `.env.local` and set the project ID, dataset, server-side preview-ticket secret, broker origin, and news origin.
4. Run `corepack pnpm typecheck`.
5. Run `corepack pnpm build`.
6. Deploy this directory as a separate Netlify Free site for `studio.z2zs.space`.

Require Sanity authentication for editorial access and keep
`X-Robots-Tag: noindex, nofollow`. Sanity CORS is restricted to
`https://news.z2zs.space` and `https://studio.z2zs.space`.
The preview URL opens a new tab through `/api/preview`; no reusable secret is embedded in Studio's client bundle or query configuration.
