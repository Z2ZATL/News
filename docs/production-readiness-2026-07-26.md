# Production readiness snapshot — updated 2026-07-27

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
- Public-safe hyphenated document IDs are live. The 14 original dotted IDs are
  preserved as a rollback copy pending a separate exact deletion approval.
- CORS contains `https://news.z2zs.space` (no credentials),
  `https://studio.z2zs.space` (credentials allowed), and the stable Studio
  preview origin (credentials allowed). There is no wildcard or production
  localhost origin.
- The expiring migration token was revoked immediately after use
- A replacement read-only `Viewer` token named
  `Z2Zs Lab Netlify preview 2026-07-27` was validated against the Sanity API and
  installed as a server-only secret in both Netlify deploy contexts. The
  superseded Viewer token has been revoked.
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

## Stable preview evidence — 2026-07-27

- GitHub merge commit `08bcd7e8e39cd1210ab639fb7fb2619fe71d8a43`
  is GitHub-verified. CI attempt 2 completed successfully after the first
  Lighthouse run exposed shared-runner score variance.
- Manual Netlify preview workflow `30219384485` completed successfully for both
  sites.
- `/th`, `/en`, the Kimi and OKMD articles, Lumixia Brief, and the direct Studio
  author route all returned HTTP 200.
- The Thai home DOM contains Thailand, United States, and China story groups,
  the Lumixia product, the Kimi story, and the named author.
- The public response has nonce CSP, COOP, CORP, `credentialless` COEP,
  restrictive permissions policy, `nosniff`, and `DENY`. Two consecutive
  requests produced different nonces.
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
