import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import {
  encodeSignatureHeader,
  SIGNATURE_HEADER_NAME,
} from "@sanity/webhook";

function sitemapPaths(xml: string): string[] {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => {
    const url = match[1];
    if (!url) throw new Error("Sitemap contains an empty location.");
    return new URL(url).pathname;
  });
}

test("every public route has a clean console and no accessibility violations", async ({
  page,
  request,
}) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  const paths = sitemapPaths(await sitemap.text());
  expect(paths.length).toBeGreaterThan(0);

  const failures: string[] = [];
  let route = "";
  page.on("console", (message) => {
    if (message.type() === "warning" || message.type() === "error") {
      failures.push(`${route} console.${message.type()}: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => {
    failures.push(`${route} pageerror: ${error.message}`);
  });

  for (const path of paths) {
    route = path;
    const response = await page.goto(path, { waitUntil: "networkidle" });
    if (!response?.ok()) {
      failures.push(`${path} returned ${String(response?.status() ?? "no response")}`);
    }
    const results = await new AxeBuilder({ page }).analyze();
    for (const violation of results.violations) {
      const targets = violation.nodes
        .map((node) => node.target.join(" > "))
        .join(", ");
      failures.push(
        `${path} axe ${violation.id}: ${String(violation.nodes.length)} node(s) — ${violation.help} — ${targets}`,
      );
    }
  }

  expect(failures, failures.join("\n")).toEqual([]);
});

test("Thai home remains readable without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const response = await page.goto("/th");
  expect(response?.ok()).toBeTruthy();
  await expect(page.locator("main")).toContainText("มองเทคโนโลยีจากโลกจริง");
  await expect(page.locator("main a[href*='/th/stories/']").first()).toBeVisible();
  await context.close();
});

test("reduced motion removes animated transitions", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/th", { waitUntil: "networkidle" });
  const animated = page.locator("[style*='animation'], [style*='transition']");
  await expect(animated).toHaveCount(0);
  await context.close();
});

test("security endpoints reject invalid input and preserve nonce integrity", async ({
  page,
  request,
}) => {
  const response = await page.goto("/th");
  expect(response?.ok()).toBeTruthy();
  const csp = response?.headers()["content-security-policy"] ?? "";
  const headerNonce = /nonce-([^' ]+)/.exec(csp)?.[1];
  expect(headerNonce).toBeTruthy();
  const htmlNonces = await page.locator("script[nonce]").evaluateAll((scripts) =>
    scripts.map((script) => (script as HTMLScriptElement).nonce),
  );
  expect(htmlNonces.length).toBeGreaterThan(0);
  expect(htmlNonces.every((nonce) => nonce === headerNonce)).toBeTruthy();

  const cspMalformed = await request.post("/api/csp-report", {
    data: "{",
    headers: { "content-type": "application/csp-report" },
  });
  expect(cspMalformed.status()).toBe(400);

  const draftUnauthorized = await request.get(
    "/api/draft?slug=../../etc&locale=th",
  );
  expect(draftUnauthorized.status()).toBe(401);

  const revalidateUnauthorized = await request.post("/api/revalidate", {
    data: "{}",
  });
  expect(revalidateUnauthorized.status()).toBe(401);

  const malformedBody = "{";
  const signature = await encodeSignatureHeader(
    malformedBody,
    Date.now(),
    "playwright-webhook-secret",
  );
  const revalidateMalformed = await request.post("/api/revalidate", {
    data: Buffer.from(malformedBody),
    headers: {
      "content-type": "application/json",
      [SIGNATURE_HEADER_NAME]: signature,
    },
  });
  expect(revalidateMalformed.status()).toBe(400);
});
