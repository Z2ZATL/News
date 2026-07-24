import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { coordinatesToPosition } from "../src/lib/atlas-geo.ts";

const EPSILON = 1e-10;

function approximatelyEqual(actual: number, expected: number): void {
  assert.ok(
    Math.abs(actual - expected) < EPSILON,
    `Expected ${String(actual)} to be approximately ${String(expected)}`,
  );
}

void describe("coordinatesToPosition", () => {
  void it("uses the same longitude convention as the equirectangular Earth texture", () => {
    const [x, y, z] = coordinatesToPosition(0, 0, 1);
    approximatelyEqual(x, 1);
    approximatelyEqual(y, 0);
    approximatelyEqual(z, 0);
  });

  void it("places 90 degrees east toward negative Z", () => {
    const [x, y, z] = coordinatesToPosition(0, 90, 1);
    approximatelyEqual(x, 0);
    approximatelyEqual(y, 0);
    approximatelyEqual(z, -1);
  });
});
