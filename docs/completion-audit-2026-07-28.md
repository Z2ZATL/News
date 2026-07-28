# Build Plan completion audit — 2026-07-28

This audit compares the current implementation with Build Plan v3, the later
founder decisions, `AGENTS.md`, and accepted ADRs 0001–0006. It distinguishes
repository completion from production infrastructure work that still requires
an exact approval.

## Status key

- **Complete** — implemented and covered by the repository gates.
- **Accepted change** — intentionally differs from Build Plan v3 because a
  later founder decision or accepted ADR supersedes it.
- **Production pending** — implementation is ready, but external production
  state must not be changed without an exact target check and approval.

## Product and content

| Requirement | Status | Evidence |
| --- | --- | --- |
| Thai and English public routes | Complete | Locale layouts and routes exist for home, stories, projects, about, privacy, terms, and search. |
| Thai default with one-hop `/` redirect | Complete | `next.config.ts` redirects `/` permanently to `/th`; there is no `Accept-Language` redirect. |
| Dark-first editorial visual system | Complete | Dark is the default and the later requested light theme is user-selectable and persistent. |
| Orbiting Atlas as progressive enhancement | Complete | Semantic DOM links are server-rendered; WebGL is client-only and has reduced-motion, no-JS, no-WebGL, and context-loss paths. |
| Category-led home page | Complete | The later founder direction replaced the featured-story block with a keyboard-accessible category browser. |
| Article dates and author attribution | Complete | Every article renders a Bangkok-time publication date and the author name. |
| Article reactions, excluding Lab pages | Complete | Reactions use the server-side adapter from ADR 0003 and are rendered only on story routes. |
| One launch article | Complete and expanded | Sanity contains seven articles and one Lab project. |
| SEO overrides and social image | Complete | The article schema now has optional bilingual meta title/description and an optional social image, with safe title/excerpt/cover fallbacks for existing records. |
| Cover caption | Complete | The existing bilingual CMS caption is projected, validated, and rendered when present. |
| Loading and error surfaces | Accepted change | ADR 0006 records why segment `loading.tsx` boundaries are omitted: Next.js leaves their streamed fallback visible when JavaScript is disabled. Localized segment error, global error, and not-found surfaces remain present. |

## CMS and rendering

| Requirement | Status | Evidence |
| --- | --- | --- |
| Sanity as production source of truth | Accepted change | ADR 0002 removes the unsafe repository-content fallback in production. |
| Private dataset | Accepted change | ADR 0004 uses a public Sanity Free dataset and limits unauthenticated queries to explicitly published documents. |
| Bilingual publish gate | Complete | Article/project/settings publish actions validate the required Thai and English fields before publishing. |
| `draft → review → published → archived` | Complete for articles | Article status supports all four states; publishing stamps `publishedAt` and `updatedAt`. |
| Draft preview in a new tab | Complete | Studio brokers a short-lived, single-use preview ticket; Presentation/iframe preview remains disabled. |
| ISR HTML | Accepted change | ADR 0001 requires dynamic per-request HTML so every response can receive a fresh CSP nonce. Sanity reads still use cache tags. |
| Signed webhook invalidation | Repository complete; production pending | Signature verification and tag invalidation are implemented. The production webhook secret and endpoint have not been connected. |
| JSON-LD route handler | Accepted change | The later nonce-CSP decision uses the audited nonce-authorized JSON-LD component. Editorial HTML is never injected. |
| Search without a public API | Complete | Search filters a prefetched index in the browser. |

## Security and operations

| Requirement | Status | Evidence |
| --- | --- | --- |
| Nonce CSP | Accepted change and complete | ADR 0001 supersedes the original static CSP. Production disallows unsafe script directives and generates a fresh nonce per response. |
| Public and Studio origins separated | Preview complete; production pending | Separate Netlify Free sites exist. Custom production domains are not attached yet. |
| Strict public headers | Repository complete | CSP, exact one-year HSTS, nosniff, frame denial, referrer, permissions, COOP, CORP, COEP, DNS-prefetch, cross-domain policy, and origin isolation are configured. |
| Input and secret boundaries | Complete | GROQ is parameterized; draft redirects and slugs are allowlisted; webhook bodies are verified raw; secrets are server-only; Portable Text protocols are allowlisted. |
| Free production baseline | Accepted change | ADR 0004 selects Netlify Free, Sanity Free, and Upstash Free. No paid add-on or automatic top-up is enabled. |
| Supply-chain gates | Complete | Frozen pnpm installs, strict type checking, zero-warning lint, secret scan, build, unit/E2E, axe, Lighthouse, and dependency audit run in CI. |
| Production audit | Complete in repository | The scheduled audit is fail-closed and checks redirects, nonce rotation, headers, feeds, sitemap/hreflang, structured data, unauthenticated preview-broker rejection, both exact CNAME targets, Studio isolation, DNSSEC authenticated-data responses through Cloudflare and Google, the protected mail/brief inventory, application DMARC, and CAA. Authenticated hostile-coordinate validation remains in the unit suite. |
| DNSSEC chain | Production pending | Cloudflare DNSKEY exists; the registrar still has no parent DS. |
| Application-subdomain DMARC | Production pending | `_dmarc.news` and `_dmarc.studio` do not exist yet. The apex must remain `p=none; sp=none`. |
| Netlify cutover | Production pending | `news` still points to Vercel and `studio` has no production DNS record. |
| Vercel retirement | Production pending | Vercel remains the rollback target until the Netlify production audit is green and retirement is separately approved. |

## Deliberate implementation equivalences

- `next/font/google` downloads the selected Google fonts at build time and
  serves them from the application rather than making browser requests to
  Google. This preserves the privacy and runtime behavior intended by the
  original `next/font/local` requirement without introducing a second checked-in
  font source.
- Project assets may be stored in the dedicated `assets` field or as reviewed
  image blocks in localized Portable Text. The Lumixia page uses reviewed
  project imagery and a semantic DOM flow diagram.
- Hosting references in Build Plan v3 are superseded by ADR 0004. The product
  architecture is unchanged: public site and Studio remain separate origins.

## Production authorization boundary

The following remain separate external mutations and are not implied by a
generic approval to finish repository work:

1. Production deploy of both reviewed Netlify sites.
2. Rotation and synchronization of `SANITY_WEBHOOK_SECRET`, followed by creation
   of the signed Sanity webhook.
3. Attachment of `news.z2zs.space` and `studio.z2zs.space` to their exact
   Netlify Free sites and change of only those approved DNS records.
4. Publication of the exact Cloudflare DS record at Newfold.
5. Creation of `_dmarc.news.z2zs.space` and
   `_dmarc.studio.z2zs.space` with `p=reject`, while preserving apex
   monitoring and every `brief`/Google Workspace record.
6. Full live production audit, rollback-window observation, and later
   decommissioning of Vercel only after a separate retirement approval.
