import { resolveCname } from "node:dns/promises";

const siteUrl = new URL(process.env.AUDIT_SITE_URL ?? "https://news.z2zs.space");
const expectedPublicCname = process.env.AUDIT_PUBLIC_CNAME?.toLowerCase();
const dnssecEnabled = process.env.AUDIT_DNSSEC_ENABLED === "true";
const productionReady = process.env.AUDIT_PRODUCTION_READY === "true";
const dryRun = process.env.AUDIT_DRY_RUN === "true";

const requiredHeaders = new Map([
  ["content-security-policy", /default-src 'none'.*script-src[^;]*'nonce-[^']+'/],
  ["cross-origin-embedder-policy", /^credentialless$/],
  ["cross-origin-opener-policy", /^same-origin$/],
  ["cross-origin-resource-policy", /^same-origin$/],
  ["origin-agent-cluster", /^\?1$/],
  ["permissions-policy", /camera=\(\).*microphone=\(\).*payment=\(\)/],
  ["referrer-policy", /^strict-origin-when-cross-origin$/],
  ["strict-transport-security", /^max-age=31536000$/],
  ["x-content-type-options", /^nosniff$/],
  ["x-dns-prefetch-control", /^off$/],
  ["x-frame-options", /^DENY$/],
  ["x-permitted-cross-domain-policies", /^none$/],
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function auditReadinessConfiguration() {
  if (!productionReady) return;
  assert(expectedPublicCname, "AUDIT_PUBLIC_CNAME is required for a production-ready audit");
  assert(dnssecEnabled, "DNSSEC checks are required for a production-ready audit");
}

function isXmlContentType(value) {
  return /^(?:application|text)\/(?:atom\+|rss\+)?xml\b/i.test(value);
}

async function auditFetch(path, init = {}) {
  return fetch(new URL(path, siteUrl), {
    ...init,
    headers: {
      "cache-control": "no-cache",
      "user-agent": "Z2Zs-Production-Audit/2.0",
      ...init.headers,
    },
    signal: AbortSignal.timeout(15_000),
  });
}

function nonceFromCsp(csp) {
  return /'nonce-([^']+)'/.exec(csp)?.[1] ?? null;
}

async function auditRedirect() {
  const response = await auditFetch("/", { redirect: "manual" });
  assert(response.status === 308, `Expected / to return 308, received ${response.status}`);
  assert(response.headers.get("location") === "/th", "Root redirect must point directly to /th");
}

async function auditHeaders() {
  const responses = await Promise.all([auditFetch("/th"), auditFetch("/th")]);
  const nonces = [];
  for (const response of responses) {
    assert(response.status === 200, `Expected /th to return 200, received ${response.status}`);
    assert(
      (response.headers.get("content-type") ?? "").startsWith("text/html"),
      "/th must return HTML",
    );
    const cacheControl = response.headers.get("cache-control") ?? "";
    assert(/private/i.test(cacheControl) && /no-store/i.test(cacheControl), "HTML must be private and no-store");
    for (const [name, pattern] of requiredHeaders) {
      const value = response.headers.get(name);
      assert(value !== null && pattern.test(value), `Missing or invalid ${name}`);
    }
    const hsts = response.headers.get("strict-transport-security") ?? "";
    assert(!/includesubdomains|preload/i.test(hsts), "HSTS must not include subdomains or preload");
    const csp = response.headers.get("content-security-policy") ?? "";
    assert(csp.includes("frame-ancestors 'none'"), "CSP must deny framing");
    assert(csp.includes("base-uri 'none'"), "CSP must deny base-uri");
    assert(csp.includes("object-src 'none'"), "CSP must deny objects");
    assert(csp.includes("form-action 'none'"), "CSP must deny forms");
    assert(csp.includes("report-uri /api/csp-report"), "CSP report endpoint is missing");
    assert(!/script-src[^;]*(?:'unsafe-inline'|'unsafe-eval')/.test(csp), "Public script CSP is unsafe");
    const nonce = nonceFromCsp(csp);
    assert(nonce, "CSP nonce is missing");
    nonces.push(nonce);
  }
  assert(nonces[0] !== nonces[1], "CSP nonce was reused across responses");
}

async function auditPublicFiles() {
  const robots = await auditFetch("/robots.txt");
  assert(robots.status === 200, `/robots.txt returned ${robots.status}`);
  const robotsBody = await robots.text();
  assert(/Disallow:\s*\/api\//i.test(robotsBody), "robots.txt must disallow /api/");
  assert(robotsBody.includes(`${siteUrl.origin}/sitemap.xml`), "robots.txt has the wrong sitemap");

  const sitemap = await auditFetch("/sitemap.xml");
  assert(sitemap.status === 200, `/sitemap.xml returned ${sitemap.status}`);
  assert(isXmlContentType(sitemap.headers.get("content-type") ?? ""), "sitemap.xml is not XML");
  const sitemapBody = await sitemap.text();
  assert(sitemapBody.includes(`${siteUrl.origin}/th`), "Thai URLs are missing from sitemap");
  assert(sitemapBody.includes(`${siteUrl.origin}/en`), "English URLs are missing from sitemap");
  assert(/hreflang="x-default"/.test(sitemapBody), "x-default hreflang is missing");
  assert(!/\/api\/|studio\.z2zs\.space/i.test(sitemapBody), "sitemap exposes a private route or Studio");

  for (const locale of ["th", "en"]) {
    const path = `/rss/${locale}.xml`;
    const response = await auditFetch(path);
    assert(response.status === 200, `${path} returned ${response.status}`);
    assert(isXmlContentType(response.headers.get("content-type") ?? ""), `${path} is not XML`);
    const body = await response.text();
    assert(/<rss\b/i.test(body), `${path} is not an RSS document`);
    assert(body.includes(`${siteUrl.origin}/${locale}/stories/`), `${path} has no story URL`);
  }

  const manifest = await auditFetch("/manifest.webmanifest");
  assert(manifest.status === 200, `/manifest.webmanifest returned ${manifest.status}`);
  assert(
    (manifest.headers.get("content-type") ?? "").includes("manifest+json"),
    "manifest.webmanifest has the wrong content type",
  );
}

async function auditArticleAndStructuredData() {
  const sitemap = await auditFetch("/sitemap.xml");
  const sitemapBody = await sitemap.text();
  const storyPath = /<loc>https?:\/\/[^<]+(\/th\/stories\/[a-z0-9-]+)<\/loc>/.exec(sitemapBody)?.[1];
  assert(storyPath, "Sitemap has no Thai article");
  const response = await auditFetch(storyPath);
  assert(response.status === 200, `${storyPath} returned ${response.status}`);
  const html = await response.text();
  assert(/<html[^>]+lang="th"/.test(html), "Thai article has the wrong lang attribute");
  assert(
    html.includes(`rel="canonical" href="${siteUrl.origin}${storyPath}"`),
    "Canonical is missing or wrong",
  );
  assert(
    /hreflang="en"/i.test(html) && /hreflang="x-default"/i.test(html),
    "Article hreflang is incomplete",
  );
  const rawJsonLd = /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/.exec(html)?.[1];
  assert(rawJsonLd, "Article JSON-LD is missing");
  const jsonLd = JSON.parse(rawJsonLd);
  assert(jsonLd["@context"] === "https://schema.org", "JSON-LD context is wrong");
  assert(jsonLd["@type"] === "NewsArticle", "JSON-LD type is wrong");
  assert(typeof jsonLd.headline === "string" && jsonLd.headline.length > 0, "JSON-LD headline is missing");
  assert(typeof jsonLd.datePublished === "string", "JSON-LD publication date is missing");
  assert(jsonLd.mainEntityOfPage === `${siteUrl.origin}${storyPath}`, "JSON-LD canonical URL is wrong");
}

async function auditSecurityEndpoints() {
  const draft = await auditFetch("/api/draft", { redirect: "manual" });
  assert(draft.status === 401, `/api/draft without a ticket returned ${draft.status}`);

  const revalidate = await auditFetch("/api/revalidate", {
    body: "{}",
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  assert(revalidate.status === 401, `/api/revalidate without a signature returned ${revalidate.status}`);

  const reactions = await auditFetch("/api/reactions", {
    body: JSON.stringify({ reaction: "like", slug: "not-a-real-article" }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  assert(reactions.status === 403, `/api/reactions without Origin returned ${reactions.status}`);
}

async function auditCname(hostname, expectedTarget) {
  let records;
  try {
    records = await resolveCname(hostname);
  } catch (error) {
    if (!(error instanceof Error) || !("code" in error) || error.code !== "ECONNREFUSED") throw error;
    const url = new URL("https://cloudflare-dns.com/dns-query");
    url.searchParams.set("name", hostname);
    url.searchParams.set("type", "CNAME");
    const response = await fetch(url, {
      headers: { accept: "application/dns-json", "user-agent": "Z2Zs-Production-Audit/2.0" },
      signal: AbortSignal.timeout(15_000),
    });
    assert(response.ok, `CNAME resolver returned HTTP ${response.status}`);
    const result = await response.json();
    assert(result && typeof result === "object", "CNAME resolver returned invalid JSON");
    records = Array.isArray(result.Answer)
      ? result.Answer
          .filter((answer) => answer?.type === 5 && typeof answer.data === "string")
          .map((answer) => answer.data)
      : [];
  }
  const values = records.map((value) => value.replace(/\.$/, "").toLowerCase());
  assert(values.length > 0, `${hostname} has no CNAME target`);
  if (expectedTarget) {
    assert(
      values.length === 1 && values[0] === expectedTarget,
      `${hostname} points outside the approved host target`,
    );
  }
  return values;
}

async function validatedDnsJson(url, recordType) {
  const response = await fetch(url, {
    headers: { accept: "application/dns-json", "user-agent": "Z2Zs-Production-Audit/2.0" },
    signal: AbortSignal.timeout(15_000),
  });
  assert(response.ok, `DNSSEC resolver returned HTTP ${response.status}`);
  const result = await response.json();
  assert(result && typeof result === "object", "DNSSEC resolver returned invalid JSON");
  assert(result.Status === 0, `DNSSEC resolver returned status ${String(result.Status)}`);
  assert(result.AD === true, "DNSSEC validating resolver did not set the authenticated-data flag");
  assert(
    Array.isArray(result.Answer) && result.Answer.some((answer) => answer?.type === recordType),
    `DNSSEC response is missing record type ${String(recordType)}`,
  );
}

async function auditDnssec() {
  const resolvers = [
    "https://cloudflare-dns.com/dns-query",
    "https://dns.google/resolve",
  ];
  const queries = [
    { name: "z2zs.space", type: "DS", recordType: 43 },
    { name: "z2zs.space", type: "DNSKEY", recordType: 48 },
    { name: "z2zs.space", type: "SOA", recordType: 6 },
  ];
  for (const resolver of resolvers) {
    for (const query of queries) {
      const url = new URL(resolver);
      url.searchParams.set("name", query.name);
      url.searchParams.set("type", query.type);
      url.searchParams.set("do", "1");
      await validatedDnsJson(url, query.recordType);
    }
  }
}

auditReadinessConfiguration();

if (!dryRun) {
  await auditRedirect();
  await auditHeaders();
  await auditPublicFiles();
  await auditArticleAndStructuredData();
  await auditSecurityEndpoints();
  const dns = { news: await auditCname(siteUrl.hostname, expectedPublicCname) };
  if (dnssecEnabled) await auditDnssec();
  console.log(
    JSON.stringify(
      {
        auditedAt: new Date().toISOString(),
        checks: {
          dnssec: dnssecEnabled,
          productionReady,
        },
        dns,
        site: siteUrl.origin,
      },
      null,
      2,
    ),
  );
}
