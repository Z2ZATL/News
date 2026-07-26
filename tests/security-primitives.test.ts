import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createPreviewTicket,
  verifyPreviewTicket,
} from "../src/lib/preview-ticket.ts";
import {
  readBoundedBody,
  RequestBodyError,
} from "../src/lib/request-body.ts";
import { redisKey } from "../src/lib/redis-key.ts";

const secret = "test-only-preview-ticket-secret-with-32-bytes";
const payload = {
  exp: 1_700_000_060,
  documentType: "article" as const,
  jti: "9a650202-3bb4-4a42-b6bb-a5e1c9f84e5a",
  locale: "th" as const,
  slug: "valid-article",
  v: 1 as const,
};

void describe("preview tickets", () => {
  void it("verifies a correctly scoped ticket", () => {
    const ticket = createPreviewTicket(payload, secret);
    assert.deepEqual(verifyPreviewTicket(ticket, secret, 1_700_000_000), payload);
  });

  void it("rejects tampering, expiry, future expiry, and the wrong secret", () => {
    const ticket = createPreviewTicket(payload, secret);
    assert.equal(verifyPreviewTicket(`${ticket}x`, secret, 1_700_000_000), null);
    assert.equal(verifyPreviewTicket(ticket, "different-secret", 1_700_000_000), null);
    assert.equal(verifyPreviewTicket(ticket, secret, 1_700_000_061), null);
    assert.equal(verifyPreviewTicket(ticket, secret, 1_699_999_999), null);
  });
});

void describe("bounded request bodies", () => {
  void it("reads an allowed body without relying on Content-Length", async () => {
    const request = new Request("https://example.test/api", {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('{"ok":'));
          controller.enqueue(new TextEncoder().encode("true}"));
          controller.close();
        },
      }),
      duplex: "half",
    } as RequestInit & { duplex: "half" });

    assert.equal(
      await readBoundedBody(request, {
        allowedContentTypes: ["application/json"],
        maximumBytes: 32,
      }),
      '{"ok":true}',
    );
  });

  void it("stops a chunked body after the configured limit", async () => {
    const request = new Request("https://example.test/api", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "0123456789",
    });
    await assert.rejects(
      readBoundedBody(request, {
        allowedContentTypes: ["application/json"],
        maximumBytes: 4,
      }),
      (error: unknown) =>
        error instanceof RequestBodyError && error.status === 413,
    );
  });

  void it("rejects unsupported media types before reading", async () => {
    const request = new Request("https://example.test/api", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: "{}",
    });
    await assert.rejects(
      readBoundedBody(request, {
        allowedContentTypes: ["application/json"],
        maximumBytes: 16,
      }),
      (error: unknown) =>
        error instanceof RequestBodyError && error.status === 415,
    );
  });
});

void describe("Redis key isolation", () => {
  void it("separates production, preview, branch, and local data", () => {
    assert.equal(
      redisKey("reaction:counts:example", { DEPLOY_ENV: "production" }),
      "z2zs:production:reaction:counts:example",
    );
    assert.equal(
      redisKey("reaction:counts:example", { DEPLOY_ENV: "preview" }),
      "z2zs:preview:reaction:counts:example",
    );
    assert.equal(
      redisKey("rate:example", { CONTEXT: "branch-deploy" }),
      "z2zs:branch:rate:example",
    );
    assert.equal(
      redisKey("preview-ticket:example", {}),
      "z2zs:development:preview-ticket:example",
    );
  });
});
