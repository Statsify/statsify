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

const BEST_TIME: StatEntry = { color: "§e", label: "stats.bestTime", unset: "N/A" };

/** The colors and labels of the bot's TNT Games card (`tntgames.profile.tsx`): a table per mode, a column each on Overall. */
export const TNT_GAMES: Game<TNTGamesModes> = {
  key: "tntgames",
  id: "TNT_GAMES",
  modes: TNT_GAMES_MODES,
  game: {
    coins: { color: "§6" },
    wins: { color: "§e", label: "stats.overallWins" },
  },
  shapes: [
    {
      modes: ["tntRun"],
      stats: {
        wins: { color: "§a" },
        losses: { color: "§c" },
        wlr: { color: "§6" },
        potionsSplashed: { color: "§5" },
        blocksRan: { color: "§b" },
        record: BEST_TIME,
      },
    },
    {
      modes: ["pvpRun"],
      stats: { wins: { color: "§a" }, kills: { color: "§a" }, deaths: { color: "§c" }, kdr: { color: "§6" }, record: BEST_TIME },
    },
    {
      modes: ["bowSpleef"],
      stats: { wins: { color: "§a" }, losses: { color: "§c" }, wlr: { color: "§6" }, hits: { color: "§e", label: "stats.shotsFired" } },
    },
    {
      modes: ["tntTag"],
      stats: {
        wins: { color: "§a" },
        kills: { color: "§a" },
        deaths: { color: "§c" },
        kdr: { color: "§6" },
        tags: { color: "§e" },
        powerups: { color: "§d" },
      },
    },
    {
      modes: ["wizards"],
      stats: {
        class: selection("§2"),
        wins: { color: "§a" },
        kills: { color: "§a" },
        deaths: { color: "§c" },
        kdr: { color: "§6" },
        assists: { color: "§e" },
        points: { color: "§5" },
        airTime: { color: "§b" },
        powerOrbs: { color: "§a" },
      },
    },
    {
      modes: TNT_WIZARDS_CLASSES.map((submode) => `wizards.${submode}`),
      stats: { kills: { color: "§a" }, deaths: { color: "§c" }, kdr: { color: "§6" }, assists: { color: "§e" } },
    },
  ],
};
