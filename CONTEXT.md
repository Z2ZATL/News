# Z2Zs Lab News context

## Purpose

Z2Zs Lab News publishes bilingual, evidence-led technology reporting and the
work-in-public output of Z2Zs Lab. The public experience is editorial first;
Orbiting Atlas is an optional visual way to navigate the same semantic links.

## Ubiquitous language

- **Article**: a bilingual editorial document controlled by Sanity.
- **Project**: a bilingual Z2Zs Lab work-in-public document controlled by Sanity.
- **Published content**: a valid Sanity document whose status is `published`.
- **Content module**: the only public-site interface for retrieving validated
  editorial content.
- **Preview broker**: the protected Studio server function that creates a
  short-lived preview ticket without exposing its signing secret to a browser.
- **Preview ticket**: a signed, single-use capability limited to one article,
  locale, and expiry.
- **Reaction**: one anonymous visitor's current response to one Article.
- **Reaction ranking**: aggregate server-side counts; browser-local state is not
  an authoritative ranking.
- **Atlas node**: one country-level DOM navigation group. Canvas rendering is a
  visual adapter and never the sole owner of a link.

## Rejected synonyms and states

- Repository article files are not a production content source.
- A locally stored reaction is not an aggregate reaction.
- A canvas-only marker is not navigation.
- A published Sanity revision with `status != "published"` is not Published content.
