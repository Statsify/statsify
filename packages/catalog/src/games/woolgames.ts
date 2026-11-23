/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type Game, type StatEntry, classesOf, selection } from "../catalog.js";
import { WOOLGAMES_MODES, type WoolGamesModes } from "@statsify/schemas";

/** Wool Wars' seven classes, its submodes after Overall, each storing the games played as it. */
export const WOOL_WARS_CLASSES = classesOf(WOOLGAMES_MODES, "woolwars");

/** What Wool Wars' Overall and each class store: the card's kills row and its sidebar's wool, blocks and power-ups. */
const CLASS: Record<string, StatEntry> = {
  kills: { color: "§a" },
  deaths: { color: "§c" },
  kdr: { color: "§6" },
  assists: { color: "§e" },
  woolPlaced: { color: "§e" },
  blocksBroken: { color: "§c" },
  powerups: { color: "§b" },
};

/** The colors and labels of the bot's Wool Games card (`woolgames.profile.tsx` and its three tables). */
export const WOOL_GAMES: Game<WoolGamesModes> = {
  key: "woolgames",
  id: "WOOLGAMES",
  modes: WOOLGAMES_MODES,
  game: {
    coins: { color: "§6", label: "stats.wool" },
    layers: { color: "§a", of: 100 },
    exp: { color: "§b", glossary: "level" },
    playtime: { color: "§d" },
    wins: { color: "§a", label: "stats.overallWins" },
  },
  shapes: [
    {
      modes: ["woolwars.overall"],
      stats: { ...CLASS, wins: { color: "§a" }, losses: { color: "§c" }, wlr: { color: "§6" }, gamesPlayed: { color: "§e" } },
    },
    { modes: WOOL_WARS_CLASSES.map((submode) => `woolwars.${submode}`), stats: CLASS },
    {
      modes: ["sheepwars"],
      stats: {
        wins: { color: "§a" },
        losses: { color: "§c" },
        wlr: { color: "§6" },
        kills: { color: "§a" },
        deaths: { color: "§c" },
        kdr: { color: "§6" },
        gamesPlayed: { color: "§e" },
        kit: selection("§b"),
        magicWool: { color: "§5" },
        sheepThrown: { color: "§c" },
        sheepKilled: { color: "§4" },
        explosiveKills: { color: "§a" },
        voidKills: { color: "§a" },
        bowKills: { color: "§a" },
        meleeKills: { color: "§a" },
      },
    },
    {
      modes: ["captureTheWool"],
      stats: {
        wins: { color: "§a" },
        losses: { color: "§c" },
        wlr: { color: "§6" },
        draws: { color: "§e" },
        kills: { color: "§a" },
        deaths: { color: "§c" },
        kdr: { color: "§6" },
        assists: { color: "§e" },
        woolPickedUp: { color: "§2" },
        woolCaptured: { color: "§b" },
        fastestWin: { color: "§e" },
        fastestWoolCapture: { color: "§6" },
        longestGame: { color: "§d" },
        goldEarned: { color: "§6" },
        goldSpent: { color: "§6" },
        // The card's Kills and Deaths under its Against Wool Holder and As Wool Holder headings.
        killsOnWoolHolder: { color: "§a", label: "stats.kills" },
        deathsToWoolHolder: { color: "§c", label: "stats.deaths" },
        killsAsWoolHolder: { color: "§a", label: "stats.kills" },
        deathsAsWoolHolder: { color: "§c", label: "stats.deaths" },
      },
    },
  ],
};
