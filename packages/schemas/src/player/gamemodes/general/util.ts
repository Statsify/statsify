/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { roundTo } from "@statsify/math";

export const getNetworkExp = (networkLevel = 1) =>
  (Math.pow((networkLevel + 2.5) * 50, 2) - 30_625) / 2;

export const getNetworkLevel = (networkExp = 0) =>
  networkExp ? roundTo(Math.sqrt(networkExp * 2 + 30_625) / 50 - 2.5) : 1;

if (import.meta.vitest) {
  const { suite, it, expect } = import.meta.vitest;

  suite("getNetworkExp and getNetworkLevel", () => {
    it("convert a network level to its exp and back", () => {
      expect(getNetworkExp(1)).toBe(0);
      expect(getNetworkExp(2)).toBe(10_000);
      expect(getNetworkExp(3)).toBe(22_500);
      expect(getNetworkLevel(0)).toBe(1);
      expect(getNetworkLevel(5000)).toBe(1.53);
      expect(getNetworkLevel(22_500)).toBe(3);

      for (const level of [1, 2, 50, 250, 1000]) {
        expect(getNetworkLevel(getNetworkExp(level))).toBe(level);
      }
    });
  });
}
