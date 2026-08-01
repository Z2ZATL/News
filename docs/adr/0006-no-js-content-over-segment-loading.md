# ADR 0006: Complete no-JavaScript content takes precedence over segment loading

Status: Accepted

## Context

Build Plan v3 requires both a complete site when JavaScript is disabled and a
`loading.tsx` surface for every route segment. In the Next.js App Router used by
this project, a segment loading boundary streams the fallback before the
resolved route. The client runtime replaces that fallback. During a production
Playwright test with JavaScript disabled, the browser received the loading
surface but could not replace it with the completed Atlas DOM and story links.

That behavior conflicts with the stronger product invariant in `AGENTS.md`:
the DOM is the product, and the page must remain readable with JavaScript
disabled, WebGL unavailable, or low-power mode active.

## Decision

- Do not add App Router segment `loading.tsx` boundaries in v1.
- Return the complete server-rendered document for public navigation, including
  the semantic Atlas links and article content.
- Keep visual interaction feedback inside optional client enhancements that do
  not replace or hide server-rendered content.
- Preserve localized `error.tsx`, `global-error.tsx`, and `not-found.tsx`
  recovery surfaces.
- Keep the JavaScript-disabled Playwright test as a release gate.

## Consequences

- A slow content request keeps the previous browser page visible until the next
  document is ready instead of showing a streamed skeleton.
- Users without JavaScript receive the real content and navigation rather than
  an unrecoverable loading fallback.
- A future framework version may permit a loading surface that does not depend
  on client-side boundary replacement. Reintroducing segment loading requires a
  passing no-JavaScript test and a new ADR update.
