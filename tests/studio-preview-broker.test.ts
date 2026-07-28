import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { verifyPreviewTicket } from "../src/lib/preview-ticket.ts";
import { createPreviewResponse } from "../studio/src/preview-broker.ts";
import { isAllowedPreviewBrokerOrigin } from "../studio/src/preview-origin.ts";

const secret = "test-only-preview-ticket-secret-with-32-bytes";
const environment = {
  newsOrigin: "https://preview-news.example.test",
  projectId: "test-project",
  secret,
  verifyEditor: () => Promise.resolve(true),
};

function previewRequest(body: unknown, authenticated = true): Request {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authenticated) {
    headers.Authorization = "Bearer test-user-session-token-with-enough-length";
  }
  return new Request("https://studio.example.test/api/preview", {
    body: JSON.stringify(body),
    headers,
    method: "POST",
  });
}

void describe("Studio preview broker", () => {
  void it("allows only an HTTPS broker on the running Studio origin", () => {
    assert.equal(
      isAllowedPreviewBrokerOrigin(
        "https://studio.example.test",
        "https://studio.example.test",
      ),
      true,
    );
    assert.equal(
      isAllowedPreviewBrokerOrigin(
        "https://attacker.example.test",
        "https://studio.example.test",
      ),
      false,
    );
    assert.equal(
      isAllowedPreviewBrokerOrigin(
        "http://studio.example.test",
        "http://studio.example.test",
      ),
      false,
    );
  });

  void it("rejects unsupported methods", async () => {
    const response = await createPreviewResponse(
      new Request("https://studio.example.test/api/preview", { method: "GET" }),
      environment,
    );
    assert.equal(response.status, 405);
  });

  void it("requires an authenticated Sanity editor before parsing coordinates", async () => {
    const unauthenticated = await createPreviewResponse(
      previewRequest(
        { documentType: "article", locale: "th", slug: "valid-article" },
        false,
      ),
      environment,
    );
    assert.equal(unauthenticated.status, 401);

    const forbidden = await createPreviewResponse(
      previewRequest({ documentType: "article", locale: "th", slug: "valid-article" }),
      { ...environment, verifyEditor: () => Promise.resolve(false) },
    );
    assert.equal(forbidden.status, 403);
  });

  void it("rejects invalid document coordinates after authentication", async () => {
    const response = await createPreviewResponse(
      previewRequest({ documentType: "article", locale: "th", slug: "../../admin" }),
      environment,
    );
    assert.equal(response.status, 400);
  });

  void it("fails closed when server-only configuration is absent", async () => {
    const response = await createPreviewResponse(previewRequest({}), {
      newsOrigin: undefined,
      projectId: undefined,
      secret: undefined,
    });
    assert.equal(response.status, 503);
  });

  void it("issues a short-lived ticket scoped to an allowlisted destination", async () => {
    const before = Math.floor(Date.now() / 1_000);
    const response = await createPreviewResponse(
      previewRequest({
        documentType: "article",
        locale: "en",
        slug: "valid-article",
      }),
      environment,
    );
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "private, no-store, max-age=0");
    const body = (await response.json()) as { url?: unknown };
    assert.equal(typeof body.url, "string");
    const location = new URL(String(body.url));
    assert.equal(location.origin, environment.newsOrigin);
    assert.equal(location.pathname, "/api/draft");
    const ticket = location.searchParams.get("ticket") ?? "";
    const payload = verifyPreviewTicket(ticket, secret, before);
    assert.ok(payload);
    assert.equal(payload.slug, "valid-article");
    assert.equal(payload.locale, "en");
    assert.equal(payload.documentType, "article");
  });
});
