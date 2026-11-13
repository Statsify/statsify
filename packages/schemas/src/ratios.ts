/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export type Ratio = [
  numerator: string,
  denominator: string,
  name: string,
  prettyName: string
];

export const LEADERBOARD_RATIOS: Ratio[] = [
  ["wins", "losses", "wlr", "WLR"],
  ["kills", "deaths", "kdr", "KDR"],
  ["finalKills", "finalDeaths", "fkdr", "FKDR"],
  ["bedsBroken", "bedsLost", "bblr", "BBLR"],
];
