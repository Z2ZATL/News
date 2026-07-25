# Production readiness snapshot — 2026-07-26

This file records read-only checks made before any production mutation. Values that are secrets are intentionally omitted.

## Public site

- Vercel project: `z2zs-lab-news` (`prj_JW8PAb96npQwnxprj9vNdWQ9bISc`)
- Production domain: `news.z2zs.space`
- Current response: HTTP 200 with nonce CSP and the expected security header set
- Current Vercel environment: no variables configured
- Consequence: the currently deployed revision still serves checked-in content; the hardened revision must not be promoted until Sanity and Redis variables exist

## Studio and CMS

- `studio.z2zs.space`: no DNS record at the time of inspection
- Separate Studio Netlify site: not linked or created
- Sanity project: `Z2Zs Lab News` (`kbore3rf`) under organization `Z2Zs`
- Sanity created an automatic 30-day Growth Trial with no payment method and an
  explicit automatic downgrade to Free; no paid upgrade was selected
- Public `production` dataset created automatically and confirmed public
- Production content migrated and verified: 7 articles, 10 assets, 1 author,
  5 categories, 1 project, and site settings
- CORS contains only `https://news.z2zs.space` (no credentials) and
  `https://studio.z2zs.space` (credentials allowed); auto-added localhost was removed
- The expiring migration token was revoked immediately after use
- Required before promotion: read-only draft token, webhook, and a separate
  Studio deployment whose editorial access requires Sanity authentication

## DNS and mail

- `news.z2zs.space`: CNAME claimed by Vercel
- `_dmarc.z2zs.space`: `p=none; sp=none`, aggregate reports to `mori@z2zs.space`
- Apex SPF: Google Workspace only (`include:_spf.google.com ~all`)
- Apex MX: Google Workspace
- Cloudflare publishes DNSKEY records, but the parent had no DS record; DNSSEC therefore had no chain of trust
- `studio.z2zs.space`: no null MX or `v=spf1 -all` because the hostname did not yet exist
- A CNAME cannot coexist with MX or SPF TXT data at the same owner name. ADR
  0005 replaces the impossible null-MX/SPF requirement with explicit DMARC
  records below each application subdomain; neither record exists yet.

## Promotion blockers

1. Provision server-side Redis for reaction aggregates, rate limits, and preview-ticket replay protection.
2. Create separate public-site and Studio Netlify Free previews without changing DNS.
3. Configure public-site and Studio environment variables, draft token, and webhook secret.
4. Run preview functional, security, accessibility, and performance checks.
5. Publish the DNSSEC DS record at the registrar; preserve existing MX/DKIM/tracking records.
6. Request exact DNS cutover approval, retain Vercel as rollback, and run production smoke checks.
7. After approval, add `_dmarc.news.z2zs.space` and
   `_dmarc.studio.z2zs.space` with `p=reject`; do not alter the apex monitoring
   policy or the `brief` sender records.

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
- Hosting migration is approved for preview testing only. DNS cutover still
  requires an exact approval. Keep Vercel live until the replacement has passed
  security, functional, and performance gates.
- Upstash Redis Free currently includes one 256 MB database and 500,000 commands
  per month. It is sufficient for the initial anonymous reaction, replay, and
  rate-limit workload, while security-sensitive operations fail closed when the
  store is unavailable.
- GitHub remains private on the Free plan. CI, signed commits, PR review practice,
  and local guardrails are required, but unavailable paid branch-enforcement
  controls are not represented as active.
- Dependabot alerts and automated security fixes are enabled. Private-repository
  rulesets remain unavailable on the current Free account; the GitHub API
  returned an explicit upgrade requirement. Commits are not yet signed because
  no repository signing key is configured; do not represent this control as active.

Official references:

- https://www.sanity.io/pricing
- https://www.sanity.io/docs/platform-management/growth-plan-trial
- https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting
- https://vercel.com/docs/deployment-protection
- https://vercel.com/docs/limits/fair-use-guidelines
- https://upstash.com/pricing/redis
- https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/
- https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/
