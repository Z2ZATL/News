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

function isChromiumGpuDiagnostic(text: string): boolean {
  return (
    text.includes("GL Driver Message") &&
    text.includes("GPU stall due to ReadPixels")
  );
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
    if (message.type() !== "warning" && message.type() !== "error") return;
    if (isChromiumGpuDiagnostic(message.text())) return;
    failures.push(`${route} console.${message.type()}: ${message.text()}`);
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
    const description = await page
      .locator('head meta[name="description"]')
      .getAttribute("content");
    if (!description?.trim()) {
      failures.push(`${path} has no meta description in the document head`);
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
  await expect(page.locator("main")).toContainText("เลือกประเทศเพื่อดูข่าวและผลงาน");
  await expect(page.locator("main a[href*='/th/stories/']").first()).toBeVisible();
  await context.close();
});

test("reduced motion removes animated transitions", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/th", { waitUntil: "networkidle" });
  const animated = page.locator("[style*='animation'], [style*='transition']");
  await expect(animated).toHaveCount(0);
  const atlas = page.locator("[data-atlas-state]");
  await atlas.hover();
  await expect(atlas).toHaveAttribute("data-atlas-state", "ready", {
    timeout: 20_000,
  });
  const marker = atlas.locator('button[data-kind="story-country"][data-country="TH"]');
  const initial = await marker.boundingBox();
  expect(initial).not.toBeNull();
  await page.mouse.move(1, 1);
  await page.mouse.move(900, 500);
  await page.waitForTimeout(350);
  const afterPointerMove = await marker.boundingBox();
  expect(afterPointerMove?.x).toBeCloseTo(initial?.x ?? 0, 1);
  expect(afterPointerMove?.y).toBeCloseTo(initial?.y ?? 0, 1);
  await context.close();
});

test("Atlas upgrades to WebGL on interaction and survives context loss", async ({
  page,
}) => {
  await page.goto("/th");
  const atlas = page.locator("[data-atlas-state]");
  const semanticNavigation = atlas.getByRole("navigation", {
    name: "ประเทศที่มีข่าวและผลงานบนแผนที่โลก",
  });
  const firstSignal = semanticNavigation.locator("button").first();
  await firstSignal.focus();
  await expect(atlas).toHaveAttribute("data-atlas-state", "ready", {
    timeout: 20_000,
  });
  await expect(firstSignal).toBeFocused();
  await expect(semanticNavigation).toBeVisible();
  const canvas = atlas.locator("canvas");
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute("aria-hidden", "true");
  const thailand = atlas.locator(
    'button[data-kind="story-country"][data-latitude="15.87"][data-longitude="100.99"]',
  );
  await expect(thailand).toBeVisible();
  await expect(atlas.locator('button[data-kind="story-country"][data-country="CN"]')).toHaveCount(1);
  await expect(
    atlas.locator('button[data-kind="story-country"][data-country="US"]'),
  ).toHaveCount(1);
  await expect(
    atlas.locator('button[data-kind="product-country"][data-country="TH"]'),
  ).toHaveCount(1);

  const initialThailandPosition = await thailand.boundingBox();
  expect(initialThailandPosition).not.toBeNull();
  await firstSignal.evaluate((element) => {
    (element as HTMLButtonElement).blur();
  });
  await expect
    .poll(async () => (await thailand.boundingBox())?.x)
    .not.toBe(initialThailandPosition?.x);

  await canvas.evaluate((element) => {
    element.dispatchEvent(
      new Event("webglcontextlost", {
        bubbles: false,
        cancelable: true,
      }),
    );
  });
  await expect(atlas).toHaveAttribute("data-atlas-state", "fallback");
  await expect.poll(() => firstSignal.evaluate((element) => element.style.left)).toBe("");
});

test("Atlas groups signals by country and reveals ranked side panels on demand", async ({
  page,
}) => {
  await page.goto("/th");
  const atlas = page.locator("[data-atlas-state]");

  await expect(atlas.locator('[data-kind="story-country"]')).toHaveCount(3);
  await expect(atlas.locator('[data-kind="product-country"]')).toHaveCount(1);
  await expect(atlas.locator("[data-atlas-card]")).toHaveCount(0);
  await atlas.hover();
  await expect(atlas).toHaveAttribute("data-atlas-state", "ready", {
    timeout: 20_000,
  });
  await page.evaluate(() => {
    window.localStorage.setItem(
      "z2zs:story-reaction:th-ai-passport-recap-developer-tools",
      "love",
    );
  });

  const thailand = atlas.locator(
    'button[data-kind="story-country"][data-country="TH"]',
  );
  await expect(thailand).toHaveAttribute("data-latitude", "15.87");
  await expect(thailand).toHaveAttribute("data-longitude", "100.99");
  await thailand.click();

  const cards = atlas.locator("[data-atlas-card]");
  await expect(cards).toHaveCount(3);
  await expect(atlas.locator("svg line")).toHaveCount(3);
  await expect(cards.nth(0)).toHaveAttribute("data-side", "left");
  await expect(cards.nth(1)).toHaveAttribute("data-side", "right");
  await expect(cards.nth(2)).toHaveAttribute("data-side", "left");
  await expect(cards.nth(0).locator("a")).toBeVisible();
  await expect(cards.nth(0).locator("a")).toHaveAttribute(
    "href",
    "/th/stories/th-ai-passport-recap-developer-tools",
  );
  await expect(cards.nth(0)).toContainText("Aitthikorn Khammee");

  const china = atlas.locator(
    'button[data-kind="story-country"][data-country="CN"]',
  );
  const switchStartedAt = Date.now();
  await china.click();
  await expect
    .poll(async () => {
      const lineX = Number(await atlas.locator("svg line").first().getAttribute("x1"));
      const dotX = Number.parseFloat(
        await china.evaluate((element) => element.style.left),
      );
      return Math.abs(lineX - dotX);
    })
    .toBeLessThan(0.5);
  expect(Date.now() - switchStartedAt).toBeLessThan(300);
});

test("story reactions persist locally and stay out of Lab pages", async ({
  page,
}) => {
  await page.goto("/th/stories/okmd-ai-playground-review");
  const love = page.getByRole("button", { name: "รักเลย" });
  await expect(love).toHaveAttribute("aria-pressed", "false");
  await love.click();
  await expect(love).toHaveAttribute("aria-pressed", "true");

  await page.reload();
  await expect(page.getByRole("button", { name: "รักเลย" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await page.goto("/th/projects/lumixia-brief");
  await expect(page.getByText("REACTION / STORY")).toHaveCount(0);
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
