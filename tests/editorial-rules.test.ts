import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ARTICLE_EXCERPT_MAX_LENGTH,
  ARTICLE_META_DESCRIPTION_MAX_LENGTH,
  ARTICLE_META_TITLE_MAX_LENGTH,
  hasCompleteSeoOverride,
  hasText,
} from "../shared/editorial-rules.ts";

void describe("editorial rules", () => {
  void it("keeps the approved article character limits in one shared module", () => {
    assert.equal(ARTICLE_EXCERPT_MAX_LENGTH, 200);
    assert.equal(ARTICLE_META_DESCRIPTION_MAX_LENGTH, 200);
    assert.equal(ARTICLE_META_TITLE_MAX_LENGTH, 70);
  });

  void it("accepts an omitted or complete SEO override and rejects partial data", () => {
    assert.equal(hasCompleteSeoOverride(undefined), true);
    assert.equal(
      hasCompleteSeoOverride({
        metaDesc: { en: "Description", th: "คำอธิบาย" },
        metaTitle: { en: "Title", th: "ชื่อเรื่อง" },
      }),
      true,
    );
    assert.equal(
      hasCompleteSeoOverride({
        metaDesc: { en: "Description", th: "" },
        metaTitle: { en: "Title", th: "ชื่อเรื่อง" },
      }),
      false,
    );
    assert.equal(hasCompleteSeoOverride("not-an-object"), false);
  });

  void it("treats whitespace-only values as empty", () => {
    assert.equal(hasText("ข่าว"), true);
    assert.equal(hasText("   "), false);
    assert.equal(hasText(null), false);
  });
});
