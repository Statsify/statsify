/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { findScoreIndex } from "@statsify/util";

export const titleScores = [
  { req: 0, color: "§f", title: "Rookie" },
  { req: 100, color: "§7", title: "Untrained" },
  { req: 250, color: "§e", title: "Amateur" },
  { req: 500, color: "§a", title: "Apprentice" },
  { req: 1000, color: "§d", title: "Experienced" },
  { req: 2000, color: "§9", title: "Seasoned" },
  { req: 3500, color: "§2", title: "Trained" },
  { req: 5000, color: "§3", title: "Skilled" },
  { req: 7500, color: "§c", title: "Talented" },
  { req: 10_000, color: "§5", title: "Professional" },
  { req: 15_000, color: "§1", title: "Expert" },
  { req: 20_000, color: "§4", title: "Master" },
];

export const getTitleIndex = (score: number): number =>
  findScoreIndex(titleScores, score);
