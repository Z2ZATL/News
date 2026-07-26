# Production readiness snapshot — 2026-07-26

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
  Actions secrets. No production deployment has been made.
- Public Netlify production and deploy-preview contexts contain the Redis
  credentials and unique 256-bit preview, webhook, reaction-cookie, and
  rate-limit secrets. Preview and production Redis keys use separate
  namespaces.

## Studio and CMS

- `studio.z2zs.space`: no DNS record at the time of inspection
- Separate Netlify Free site: `z2zs-lab-studio`
  (`ca35a549-f925-4bbb-9427-82a073715af0`), created without Git linking.
- The Studio has the same preview-ticket secret as the public site and has its
  public Sanity project/dataset configuration. Its server-side public-preview
  destination will be set after the first public deploy-preview URL exists.
- Sanity project: `Z2Zs Lab News` (`kbore3rf`) under organization `Z2Zs`
- Sanity created an automatic 30-day Growth Trial with no payment method and an
  explicit automatic downgrade to Free; no paid upgrade was selected
- Public `production` dataset created automatically and confirmed public
- Production content migrated and verified: 7 articles, 10 assets, 1 author,
  5 categories, 1 project, and site settings
- CORS contains only `https://news.z2zs.space` (no credentials) and
  `https://studio.z2zs.space` (credentials allowed); auto-added localhost was removed
- The expiring migration token was revoked immediately after use
- A dedicated `Viewer` token named `Z2Zs Lab draft preview` was created and
  verified against the Sanity API without exposing or committing its value
- Required before promotion: install the viewer token as a server-only hosting
  variable, create the signed webhook, and deploy a separate Studio whose
  editorial access requires Sanity authentication

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

1. Create separate public-site and Studio Netlify Free previews without changing DNS.
2. Finish the public-site and Studio environment variables, install the existing
   viewer token as server-only, and create the webhook secret.
3. Run preview functional, security, accessibility, and performance checks.
4. Publish the DNSSEC DS record at the registrar; preserve existing MX/DKIM/tracking records.
5. Request exact DNS cutover approval, retain Vercel as rollback, and run production smoke checks.
6. After approval, add `_dmarc.news.z2zs.space` and
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
- https://docs.netlify.com/build/git-workflows/overview/
- https://docs.netlify.com/api-and-cli-guides/cli-guides/get-started-with-cli/
