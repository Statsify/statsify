/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export enum HypixelNormalRanks {
  "NONE",
  "NORMAL",
  "VIP",
  "VIP_PLUS",
  "MVP",
  "MVP_PLUS",
}

export enum HypixelSpecialRanks {
  "YOUTUBER",
  "ADMIN",
  "GAME_MASTER",
}

export type HypixelRanks = HypixelNormalRanks | HypixelSpecialRanks;
