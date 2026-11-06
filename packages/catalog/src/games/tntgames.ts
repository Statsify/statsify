/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type Game, type StatEntry, classesOf, selection } from "../catalog.js";
import { TNT_GAMES_MODES, type TNTGamesModes } from "@statsify/schemas";

/** Wizards' ten classes, its submodes after Overall, each storing its kills, deaths and assists. */
export const TNT_WIZARDS_CLASSES = classesOf(TNT_GAMES_MODES, "wizards");

const BEST_TIME: StatEntry = { colour: "§e", label: "stats.bestTime", unset: "N/A" };

/** The colours and labels of the bot's TNT Games card (`tntgames.profile.tsx`): a table per mode, a column each on Overall. */
export const TNT_GAMES: Game<TNTGamesModes> = {
  key: "tntgames",
  id: "TNT_GAMES",
  modes: TNT_GAMES_MODES,
  game: {
    coins: { colour: "§6" },
    wins: { colour: "§e", label: "stats.overallWins" },
  },
  shapes: [
    {
      modes: ["tntRun"],
      stats: {
        wins: { colour: "§a" },
        losses: { colour: "§c" },
        wlr: { colour: "§6" },
        potionsSplashed: { colour: "§5" },
        blocksRan: { colour: "§b" },
        record: BEST_TIME,
      },
    },
    {
      modes: ["pvpRun"],
      stats: { wins: { colour: "§a" }, kills: { colour: "§a" }, deaths: { colour: "§c" }, kdr: { colour: "§6" }, record: BEST_TIME },
    },
    {
      modes: ["bowSpleef"],
      stats: { wins: { colour: "§a" }, losses: { colour: "§c" }, wlr: { colour: "§6" }, hits: { colour: "§e", label: "stats.shotsFired" } },
    },
    {
      modes: ["tntTag"],
      stats: {
        wins: { colour: "§a" },
        kills: { colour: "§a" },
        deaths: { colour: "§c" },
        kdr: { colour: "§6" },
        tags: { colour: "§e" },
        powerups: { colour: "§d" },
      },
    },
    {
      modes: ["wizards"],
      stats: {
        class: selection("§2"),
        wins: { colour: "§a" },
        kills: { colour: "§a" },
        deaths: { colour: "§c" },
        kdr: { colour: "§6" },
        assists: { colour: "§e" },
        points: { colour: "§5" },
        airTime: { colour: "§b" },
        powerOrbs: { colour: "§a" },
      },
    },
    {
      modes: TNT_WIZARDS_CLASSES.map((submode) => `wizards.${submode}`),
      stats: { kills: { colour: "§a" }, deaths: { colour: "§c" }, kdr: { colour: "§6" }, assists: { colour: "§e" } },
    },
  ],
};
