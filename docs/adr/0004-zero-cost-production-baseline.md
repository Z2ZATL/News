# ADR 0004: Zero-cost production baseline

Status: Accepted

## Context

The founder requires the initial production system to run without recurring
platform fees. Some controls in Build Plan v3 assume paid service tiers: a
private Sanity dataset, multiple Vercel WAF rate-limit rules, production-domain
password protection, and enforceable branch protection on a private GitHub
repository.

## Decision

- Use the Sanity Free plan and one public `production` dataset. Sanity draft
  documents remain unavailable to unauthenticated API requests; the public site
  additionally queries only explicitly published records. Published documents
  must be treated as public data, and no secret or private personal data may be
  stored in editorial documents.
- Keep Sanity Studio on a separate origin. Editing requires Sanity
  authentication and project membership. Do not start a paid trial merely to
  obtain a private dataset or additional roles.
- Do not use Vercel Hobby as the permanent host if Z2Zs Lab advertises products,
  services, or other work for financial gain. Vercel limits Hobby to personal,
  non-commercial use.
- Prefer Netlify Free as the zero-cost commercial-capable host after a preview
  deployment passes the complete security, functional, and performance gates.
  Its hard monthly credit limit prevents surprise billing; the site pauses if
  the allowance is exhausted. Netlify's maintained OpenNext adapter supports the
  App Router, SSR, route handlers, Draft Mode, image optimization, and tag-based
  revalidation used by this application.
- Do not connect the private `Z2ZATL/News` organization repository to Netlify.
  Netlify reserves private organization-repository Git integration for paid
  plans. Keep CI on GitHub Actions and use the authenticated Netlify CLI from a
  manually dispatched Linux workflow after a reviewed, green commit. This also
  avoids the OpenNext symlink failure observed on Windows with pnpm. A draft
  deploy is created without `--prod`; production additionally requires the
  exact confirmation phrase recorded in the workflow after approval.
- The founder has accepted the zero-cost constraint. Build and test a Netlify
  preview, but keep the current Vercel deployment as rollback until the Netlify
  preview passes every gate and DNS cutover is explicitly approved.
- Use the Upstash Redis Free plan for reactions, replay protection, and
  application rate limits. Fail closed for security-sensitive writes if Redis
  is unavailable, and monitor quota use before it approaches the free limit.
- Keep the GitHub repository private on the Free plan. CI gates, signed commits,
  pull-request review discipline, and local guardrails remain required, but
  server-enforced protected-branch controls are not claimed unless the account
  later gains that capability.
- Do not enable a trial, paid add-on, metered overage, or plan upgrade without a
  new explicit founder decision.

## Consequences

- The launch has no new recurring platform charge while usage stays within each
  provider's free quota. The already-owned domain remains an existing external
  cost. A free host may pause rather than bill when its hard limit is reached.
- Published Sanity content is queryable by the public and must be designed for
  disclosure. Drafts are not returned to unauthenticated users, but embargoed or
  highly confidential material should not be placed in a public dataset.
- Defense in depth is preserved through host-level protection plus the existing
  application-level endpoint limits rather than paid-only edge controls.
- A future need for confidential CMS records, more granular Sanity roles,
  production-domain access protection, enforced private-repository branch
  rules, or usage beyond free quotas requires a new cost decision.
- Netlify will not create deploys automatically from Git pushes. This avoids a
  paid repository integration and prevents unreviewed code from reaching
  production, at the cost of a deliberate manual release step.
