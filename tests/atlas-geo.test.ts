import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  coordinatesToPosition,
  isPositionVisibleFromCamera,
} from "../src/lib/atlas-geo.ts";

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

void describe("isPositionVisibleFromCamera", () => {
  void it("keeps a marker visible when OrbitControls moves the camera in front of it", () => {
    assert.equal(isPositionVisibleFromCamera([2.18, 0, 0], [7, 0, 0]), true);
  });

  void it("hides a marker when the globe blocks it from the current camera", () => {
    assert.equal(isPositionVisibleFromCamera([-2.18, 0, 0], [7, 0, 0]), false);
  });

  void it("uses the current camera direction on every axis", () => {
    const directions = [
      [1, 0, 0],
      [-1, 0, 0],
      [0, 1, 0],
      [0, -1, 0],
      [0, 0, 1],
      [0, 0, -1],
    ] as const;

    for (const [x, y, z] of directions) {
      assert.equal(
        isPositionVisibleFromCamera(
          [x * 2.18, y * 2.18, z * 2.18],
          [x * 7, y * 7, z * 7],
        ),
        true,
      );
      assert.equal(
        isPositionVisibleFromCamera(
          [-x * 2.18, -y * 2.18, -z * 2.18],
          [x * 7, y * 7, z * 7],
        ),
        false,
      );
    }
  });
});
