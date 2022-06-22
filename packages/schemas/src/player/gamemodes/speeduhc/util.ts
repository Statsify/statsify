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
