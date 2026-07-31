# Production readiness snapshot — updated 2026-07-28

> Historical pre-cutover snapshot. Netlify production, the approved DNS
> cutover, DNSSEC, webhook activation, Vercel retirement, and later security
> operations supersede the pending-state observations below. Use
> `SECURITY-OPERATIONS.md` and the scheduled public-site production audit for
> current operating requirements.

This file records read-only checks made before any production mutation. Values that are secrets are intentionally omitted.

## Public site

- Vercel project: `z2zs-lab-news` (`prj_JW8PAb96npQwnxprj9vNdWQ9bISc`)
- Production domain: `news.z2zs.space`
- Current response: HTTP 200 with nonce CSP and the expected security header set
- Current Vercel environment: no variables configured
- Consequence: the currently deployed revision still serves checked-in content; the hardened revision must not be promoted until Sanity and Redis variables exist
- Netlify Free site: `z2zs-lab-news`
  (`8e8112ad-869b-4b26-bef4-96a70b7f6c2b`), created without Git linking.
- The Netlify authentication token and both site IDs are installed as GitHub
  Actions secrets.
- Stable preview: `https://preview--z2zs-lab-news.netlify.app`. The site has
  no published production deploy, custom domain, or domain alias.
- Public Netlify production and deploy-preview contexts contain the Redis
  credentials and unique 256-bit preview, webhook, reaction-cookie, and
  rate-limit secrets. Preview and production Redis keys use separate
  namespaces.
- The stable `preview--` alias is a Netlify **branch deploy**, not a Deploy
  Preview. Its Branch deploy context now has the public Sanity identifiers,
  an expiring Viewer token, Redis credentials, and independently generated
  preview/webhook/reaction/rate-limit secrets. A stable alias must not be
  treated as covered by the Deploy Previews context.
- Public-site environment metadata was re-read through the Netlify API after
  setup. It contains no `SANITY_STUDIO_*` variables.

## Studio and CMS

- `studio.z2zs.space`: no DNS record at the time of inspection
- Separate Netlify Free site: `z2zs-lab-studio`
  (`ca35a549-f925-4bbb-9427-82a073715af0`), created without Git linking.
- Stable preview: `https://preview--z2zs-lab-studio.netlify.app`. The site has
  no published production deploy, custom domain, or domain alias. A direct
  Studio route such as `/structure/author` returns the SPA shell rather than a
  host-level 404.
- The Studio has the same preview-ticket secret as the public site and has its
  public Sanity project/dataset configuration. Its deploy-preview broker points
  only to the stable public preview.
- The Studio Branch deploy context also contains the synchronized preview
  ticket, `NEWS_PREVIEW_ORIGIN`, Studio project/dataset identifiers, and the
  stable Studio broker origin. No Sanity read token or Redis credential is
  present in the Studio project.
- The reviewed broker now requires a Sanity user-session bearer token and
  verifies an editor, developer, or administrator role against the fixed
  project API before issuing a preview ticket. The Studio deploy-preview and
  `preview` branch contexts now set `SANITY_STUDIO_NEWS_ORIGIN` to the stable
  public preview origin; this was read back through the Netlify CLI after the
  update. No production context was changed.
- Studio environment metadata was re-read through the Netlify API after setup.
  It contains only the Studio project, dataset, synchronized preview ticket,
  and context-specific preview-broker origins. Netlify Free rejected build-only
  variable scopes as a paid control, so the standard Free scopes are retained;
  Studio remains a static build and no secret is referenced by client code.
- Sanity project: `Z2Zs Lab News` (`kbore3rf`) under organization `Z2Zs`
- Sanity created an automatic 30-day Growth Trial with no payment method and an
  explicit automatic downgrade to Free. The project plan page provides no
  early-downgrade control, so the trial cannot be ended from project settings;
  no paid upgrade was selected.
- Public `production` dataset created automatically and confirmed public
- Public production content re-verified through the unauthenticated Sanity API:
  7 articles, 1 author, 5 categories, 1 project, and site settings.
- Public-safe hyphenated document IDs are live. A second read-only audit on
  2026-07-28 found that a later migration had recreated 14 original dotted
  IDs beside the 14 canonical records. The dotted records were removed only
  after exporting a recovery archive to
  `Z2Zs Labs/News Backups/sanity-production-before-legacy-dedup-2026-07-28.tar.gz`
  (SHA-256
  `4F1842ABD9BB6AADC1EA8B14EB5814570188979BA1AD90C82B5BC1F9A91FF764`).
  Studio then showed exactly 7 articles and 1 canonical author.
- CORS contains `https://news.z2zs.space` (no credentials),
  `https://studio.z2zs.space` (credentials allowed), and the stable Studio
  preview origin (credentials allowed). There is no wildcard or production
  localhost origin.
- The expiring migration token was revoked immediately after use
- A replacement read-only `Viewer` token named
  `Z2Zs Lab Netlify preview 2026-07-27` was validated against the Sanity API and
  installed as a server-only secret in both Netlify deploy contexts. The
  superseded Viewer token has been revoked.
- A separate branch-only Viewer token named
  `Netlify Preview Viewer 2026-07-28` expires on 2026-10-26. It is used only by
  the stable branch preview and is not present in client code or Studio.
- Required before promotion: rotate and synchronize a new webhook secret,
  create the signed Sanity webhook, and perform an explicitly confirmed
  production release. Editorial access to Studio already requires Sanity
  authentication.

## DNS and mail

- `news.z2zs.space`: CNAME claimed by Vercel
- `studio.z2zs.space`: no DNS record
- `_dmarc.z2zs.space`: `p=none; sp=none`, aggregate reports to `mori@z2zs.space`
- Apex SPF: Google Workspace only (`include:_spf.google.com ~all`)
- Apex MX: Google Workspace
- Cloudflare publishes DNSKEY records, but the parent had no DS record; DNSSEC therefore had no chain of trust
- `studio.z2zs.space`: no null MX or `v=spf1 -all` because the hostname did not yet exist
- A CNAME cannot coexist with MX or SPF TXT data at the same owner name. ADR
  0005 replaces the impossible null-MX/SPF requirement with explicit DMARC
  records below each application subdomain; neither record exists yet.

## Promotion blockers

1. Rotate and synchronize a new server-only webhook secret, then create the
   signed Sanity webhook.
2. Publish the DNSSEC DS record at the registrar; preserve existing
   MX/DKIM/tracking records.
3. Receive the workflow's exact production confirmation and deploy both
   reviewed Netlify sites to production.
4. Receive exact DNS mutation approval, attach both custom domains, and change
   only the approved `news` and `studio` CNAME records. Retain Vercel as rollback.
5. Run production functional, security, accessibility, performance, feed,
   structured-data, and DNS checks.
6. After exact approval, add `_dmarc.news.z2zs.space` and
   `_dmarc.studio.z2zs.space` with `p=reject`; do not alter the apex monitoring
   policy or the `brief` sender records.

## Stable preview evidence — 2026-07-28

- GitHub-verified commit `fe426b848c9df8d3c28bd8b5617b13025abe4ecd`
  passed main CI workflow `30369729410`. Type checking, linting, unit tests,
  migration checks, secret scanning, build, Netlify offline build, audit,
  Lighthouse, and all 10 Playwright tests completed successfully.
- Mobile Lighthouse performance was 99 for Thai and English home, 95/98 for
  the Thai/English OKMD article, and 98 for both Lumixia routes. Desktop
  performance was 100 on all six routes; accessibility, best practices, and
  SEO were 100 throughout.
- Manual Netlify preview workflow `30375081393` completed successfully for both
  sites. Public-only workflow `30376451161` then redeployed the corrected
  branch-only Viewer token.
- `/th`, `/en`, the GPT-Live, Kimi and OKMD articles, Lumixia Brief, and the
  direct Studio author route all returned HTTP 200.
- A live browser check confirmed that the Atlas begins in its lightweight
  `waiting` state, upgrades to `ready` only after interaction, exposes four
  country/product points, and renders one WebGL canvas with three selected-news
  cards. The category browser remains deferred before scroll.
- The reaction API returned HTTP 200 from the stable preview. Selecting
  `love` updated the aggregate, survived reload through its anonymous signed
  cookie, and remained absent from the Lumixia Lab page.
- Studio's preview broker returned a signed one-time ticket. Its first use
  redirected to `/th/stories/okmd-ai-playground-review` with HTTP 307 and a
  replay of the same ticket returned HTTP 401.
- The public response has nonce CSP, COOP, CORP, `credentialless` COEP,
  restrictive permissions policy, `nosniff`, and `DENY`. Two consecutive
  requests produced different nonces.
- The unauthenticated Sanity API still returns 7 articles, 1 author,
  5 categories, 1 project, and 1 settings document.
- Read-only DNS checks still show `news.z2zs.space` on Vercel,
  no `studio.z2zs.space` record, no parent DS record, and no application
  subdomain DMARC records. The apex DMARC record remains
  `p=none; sp=none`.
- Netlify adds `includeSubDomains; preload` only on its own `*.netlify.app`
  preview hostname. Repository configuration remains
  `Strict-Transport-Security: max-age=31536000`; the production audit rejects
  preload or subdomain inheritance on `news.z2zs.space`.

## Accepted zero-cost baseline on 2026-07-26

- The founder requires zero recurring platform fees. No trial, paid add-on,
  metered overage, or upgrade may be enabled without a new founder decision.
- Sanity Free provides two public datasets. Draft documents do not appear to
  unauthenticated API users, while published documents in a public dataset are
  publicly queryable. The site still filters explicitly for published status,
  and editorial documents must contain no secrets or confidential personal data.
- Vercel Hobby is restricted to personal, non-commercial use. Because the stated
  product direction includes promoting Z2Zs work, the current deployment cannot
  be represented as a permanent zero-cost commercial host without clarification.
- ADR 0004 selects Netlify Free for production. Netlify explicitly permits
  commercial projects on Free, applies a hard 300-credit monthly limit with no
  automatic recharge, and pauses the project rather than creating a surprise
  bill. Its OpenNext adapter supports the Next.js features used by this repo.
- The live account API confirmed plan `credit-free`, 300 included credits,
  0 credits used, no Stripe payment method, `auto_topup_enabled: false`, and no
  Pro or Enterprise trial before either site was created.
- Private organization-repository Git integration is a paid Netlify feature.
  The accepted Free design leaves both Netlify sites unlinked and uses manual
  CLI deploys from reviewed, CI-green commits instead.
- Hosting migration is approved for preview testing only. DNS cutover still
  requires an exact approval. Keep Vercel live until the replacement has passed
  security, functional, and performance gates.
- Upstash Redis Free currently includes one 256 MB database and 500,000 commands
  per month. It is sufficient for the initial anonymous reaction, replay, and
  rate-limit workload, while security-sensitive operations fail closed when the
  store is unavailable.
- Database `z2zs-lab-news` was created on AWS `us-east-2` to match Netlify
  Free's fixed Ohio Functions region. The Upstash dashboard confirmed Free Tier,
  $0 monthly cost, 0 commands, and no payment method at creation.
- GitHub remains private on the Free plan. CI, GitHub-verified squash merges,
  PR review practice, and local guardrails are required, but unavailable paid
  branch-enforcement controls are not represented as active.
- Dependabot alerts and automated security fixes are enabled. Private-repository
  rulesets remain unavailable on the current Free account; the GitHub API
  returned an explicit upgrade requirement. Local commits are not signed
  because no local signing key is configured; production-bound squash merges
  are performed by GitHub and their verification status is checked before
  release.

Official references:

- https://www.sanity.io/pricing
- https://www.sanity.io/docs/platform-management/growth-plan-trial
- https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting
- https://vercel.com/docs/deployment-protection
- https://vercel.com/docs/limits/fair-use-guidelines
- https://upstash.com/pricing/redis
- https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/
- https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/
- https://docs.netlify.com/build/git-workflows/overview/
- https://docs.netlify.com/api-and-cli-guides/cli-guides/get-started-with-cli/
- https://answers.netlify.com/t/security-headers-adding-includesubdomains-and-preload-to-strict-transport-security-header-to-sites-with-default-domain-name/19706
