import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { verifyPreviewTicket } from "../src/lib/preview-ticket.ts";
import { createPreviewResponse } from "../studio/src/preview-broker.ts";

const secret = "test-only-preview-ticket-secret-with-32-bytes";
const environment = {
  newsOrigin: "https://preview-news.example.test",
  secret,
};

void describe("Studio preview broker", () => {
  void it("rejects unsupported methods and invalid document coordinates", () => {
    assert.equal(
      createPreviewResponse(
        new Request("https://studio.example.test/api/preview", { method: "POST" }),
        environment,
      ).status,
      405,
    );
    assert.equal(
      createPreviewResponse(
        new Request(
          "https://studio.example.test/api/preview?slug=../../admin&locale=th&type=article",
        ),
        environment,
      ).status,
      400,
    );
  });

  void it("fails closed when server-only configuration is absent", () => {
    const response = createPreviewResponse(
      new Request(
        "https://studio.example.test/api/preview?slug=valid-article&locale=th&type=article",
      ),
      { newsOrigin: undefined, secret: undefined },
    );
    assert.equal(response.status, 503);
  });

  void it("issues a short-lived ticket scoped to an allowlisted destination", () => {
    const before = Math.floor(Date.now() / 1_000);
    const response = createPreviewResponse(
      new Request(
        "https://studio.example.test/api/preview?slug=valid-article&locale=en&type=article",
      ),
      environment,
    );
    assert.equal(response.status, 302);
    assert.equal(response.headers.get("cache-control"), "private, no-store, max-age=0");
    const location = new URL(response.headers.get("location") ?? "");
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
