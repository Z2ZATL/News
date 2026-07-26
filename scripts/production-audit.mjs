import { resolveCname } from "node:dns/promises";

const siteUrl = new URL(process.env.AUDIT_SITE_URL ?? "https://news.z2zs.space");
const expectedCnameSuffix = process.env.AUDIT_CNAME_SUFFIX?.toLowerCase();
const studioEnabled = process.env.AUDIT_STUDIO_ENABLED === "true";

const requiredHeaders = new Map([
  ["content-security-policy", /default-src 'none'.*script-src[^;]*'nonce-[^']+'/],
  ["cross-origin-opener-policy", /^same-origin$/],
  ["cross-origin-resource-policy", /^same-origin$/],
  ["permissions-policy", /camera=\(\).*microphone=\(\)/],
  ["referrer-policy", /^strict-origin-when-cross-origin$/],
  ["strict-transport-security", /^max-age=31536000$/],
  ["x-content-type-options", /^nosniff$/],
  ["x-frame-options", /^DENY$/],
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function auditHeaders() {
  const response = await fetch(new URL("/th", siteUrl), {
    headers: { "user-agent": "Z2Zs-Production-Audit/1.0" },
    redirect: "error",
    signal: AbortSignal.timeout(15_000),
  });
  assert(response.status === 200, `Expected /th to return 200, received ${response.status}`);
  for (const [name, pattern] of requiredHeaders) {
    const value = response.headers.get(name);
    assert(value !== null && pattern.test(value), `Missing or invalid ${name}`);
  }
  const hsts = response.headers.get("strict-transport-security") ?? "";
  assert(!/includesubdomains|preload/i.test(hsts), "HSTS must not include subdomains or preload");
}

async function auditPublicFiles() {
  for (const path of ["/robots.txt", "/sitemap.xml", "/rss/th.xml", "/rss/en.xml"]) {
    const response = await fetch(new URL(path, siteUrl), {
      headers: { "user-agent": "Z2Zs-Production-Audit/1.0" },
      signal: AbortSignal.timeout(15_000),
    });
    assert(response.status === 200, `${path} returned ${response.status}`);
    assert((response.headers.get("content-type") ?? "").length > 0, `${path} has no content type`);
  }
}

async function auditCname(hostname) {
  const values = (await resolveCname(hostname)).map((value) => value.replace(/\.$/, "").toLowerCase());
  assert(values.length > 0, `${hostname} has no CNAME target`);
  if (expectedCnameSuffix) {
    assert(
      values.every((value) => value.endsWith(expectedCnameSuffix)),
      `${hostname} points outside the approved host target`,
    );
  }
  return values;
}

await auditHeaders();
await auditPublicFiles();
const dns = { news: await auditCname(siteUrl.hostname) };
if (studioEnabled) dns.studio = await auditCname("studio.z2zs.space");
console.log(JSON.stringify({ auditedAt: new Date().toISOString(), dns, site: siteUrl.origin }, null, 2));
