/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { findScoreIndex } from "@statsify/util";

export const titleScores = [
  { req: 0, title: "Hiker" },
  { req: 50, title: "Jogger" },
  { req: 300, title: "Runner" },
  { req: 1050, title: "Sprinter" },
  { req: 2550, title: "Turbo" },
  { req: 5550, title: "Sanic" },
  { req: 15_550, title: "Hot Rod" },
  { req: 30_550, title: "Bolt" },
  { req: 55_550, title: "Zoom" },
  { req: 85_550, title: "God Speed" },
];

export const getLevelIndex = (score: number): number =>
  findScoreIndex(titleScores, score);

if (import.meta.vitest) {
  const { suite, it, expect } = import.meta.vitest;

  suite("getLevelIndex", () => {
    it("finds the title for the score", () => {
      expect(getLevelIndex(0)).toBe(0);
      expect(getLevelIndex(49)).toBe(0);
      expect(getLevelIndex(50)).toBe(1);
      expect(getLevelIndex(85_549)).toBe(8);
      expect(getLevelIndex(85_550)).toBe(9);
      expect(getLevelIndex(1_000_000)).toBe(9);
    });
  });
}
