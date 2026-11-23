/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type GameLayout, prefixLevel } from "./layout.js";
import { QUAKE } from "@statsify/catalog";

/** The card's sidebar over the table every mode shares, then the 2017+ Kills the card leaves out. */
export const QUAKE_PAGE: GameLayout = {
  game: QUAKE,
  // Overall kills set the prefix.
  level: {
    key: "kills",
    at: "overall",
    label: "stats.prefix",
    progress: "stats.progression.kill",
    read: ({ quake }) => prefixLevel(quake),
  },
  overview: ["coins", "tokens", "godlikes", "trigger", "highestKillstreak"],
  mostPlayed: {},
  page: () => ({
    sections: [
      { rows: [["wins", "kwr", "killstreaks"], ["shotsFired", "headshots", "quakeShotAccuracy"], ["kills", "deaths", "kdr"]] },
      { title: "game.sections.more", rows: [["postUpdateKills"]] },
    ],
  }),
};
