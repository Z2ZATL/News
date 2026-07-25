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
- Separate Studio Vercel project: not linked or created
- Sanity account: authenticated in the browser, but no project existed at inspection time
- Required before promotion: private `production` dataset, viewer token, migration-only editor token, strict CORS origins, webhook, and protected Studio deployment

## DNS and mail

- `news.z2zs.space`: CNAME claimed by Vercel
- `_dmarc.z2zs.space`: `p=none; sp=none`, aggregate reports to `mori@z2zs.space`
- Apex SPF: Google Workspace only (`include:_spf.google.com ~all`)
- Apex MX: Google Workspace
- Cloudflare publishes DNSKEY records, but the parent had no DS record; DNSSEC therefore had no chain of trust
- `studio.z2zs.space`: no null MX or `v=spf1 -all` because the hostname did not yet exist

## Promotion blockers

1. Create/configure the Sanity project and migrate the seven articles, one project, site settings, and image assets.
2. Provision server-side Redis for reaction aggregates, rate limits, and preview-ticket replay protection.
3. Create and protect the Studio Vercel project, then add the DNS-only Studio CNAME.
4. Configure public-site and Studio environment variables and secrets.
5. Configure Vercel Firewall limits and preview deployment protection.
6. Publish the DNSSEC DS record at the registrar; preserve existing MX/DKIM/tracking records.
7. Run staging and production smoke/security checks before promotion.

## Plan and billing constraints verified on 2026-07-26

- Sanity Free permits public datasets only. The locked private-dataset decision
  requires Growth (currently listed at USD 15 per seat per month) after the
  automatic trial ends. Do not create a private dataset on a trial without an
  accepted paid-plan decision, because Sanity documents that it becomes public
  when the trial expires.
- The current Vercel owner is a personal project owner. Hobby permits one WAF
  rate-limit rule per project; the three-rule layout in Build Plan v3 requires
  Pro or a documented replacement with application-level limits.
- Vercel Password Protection is an Advanced Deployment Protection feature.
  Vercel Authentication is the preferred shared-password-free alternative, but
  protecting a production custom domain still requires a paid protection scope.
- Upstash Redis Free currently includes one 256 MB database and 500,000 commands
  per month. It is sufficient for the initial anonymous reaction, replay, and
  rate-limit workload, while application behavior remains fail-closed when the
  store is unavailable.

Official references:

- https://www.sanity.io/pricing
- https://www.sanity.io/docs/platform-management/growth-plan-trial
- https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting
- https://vercel.com/docs/deployment-protection
- https://upstash.com/pricing/redis
