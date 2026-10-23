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
  kills: { colour: "§a" },
  deaths: { colour: "§c" },
  kdr: { colour: "§6" },
  assists: { colour: "§e" },
  woolPlaced: { colour: "§e" },
  blocksBroken: { colour: "§c" },
  powerups: { colour: "§b" },
};

/** The colours and labels of the bot's Wool Games card (`woolgames.profile.tsx` and its three tables). */
export const WOOL_GAMES: Game<WoolGamesModes> = {
  key: "woolgames",
  id: "WOOLGAMES",
  modes: WOOLGAMES_MODES,
  game: {
    coins: { colour: "§6", label: "stats.wool" },
    layers: { colour: "§a", of: 100 },
    exp: { colour: "§b", glossary: "level" },
    playtime: { colour: "§d" },
    wins: { colour: "§a", label: "stats.overallWins" },
  },
  shapes: [
    {
      modes: ["woolwars.overall"],
      stats: { ...CLASS, wins: { colour: "§a" }, losses: { colour: "§c" }, wlr: { colour: "§6" }, gamesPlayed: { colour: "§e" } },
    },
    { modes: WOOL_WARS_CLASSES.map((submode) => `woolwars.${submode}`), stats: CLASS },
    {
      modes: ["sheepwars"],
      stats: {
        wins: { colour: "§a" },
        losses: { colour: "§c" },
        wlr: { colour: "§6" },
        kills: { colour: "§a" },
        deaths: { colour: "§c" },
        kdr: { colour: "§6" },
        gamesPlayed: { colour: "§e" },
        kit: selection("§b"),
        magicWool: { colour: "§5" },
        sheepThrown: { colour: "§c" },
        sheepKilled: { colour: "§4" },
        explosiveKills: { colour: "§a" },
        voidKills: { colour: "§a" },
        bowKills: { colour: "§a" },
        meleeKills: { colour: "§a" },
      },
    },
    {
      modes: ["captureTheWool"],
      stats: {
        wins: { colour: "§a" },
        losses: { colour: "§c" },
        wlr: { colour: "§6" },
        draws: { colour: "§e" },
        kills: { colour: "§a" },
        deaths: { colour: "§c" },
        kdr: { colour: "§6" },
        assists: { colour: "§e" },
        woolPickedUp: { colour: "§2" },
        woolCaptured: { colour: "§b" },
        fastestWin: { colour: "§e" },
        fastestWoolCapture: { colour: "§6" },
        longestGame: { colour: "§d" },
        goldEarned: { colour: "§6" },
        goldSpent: { colour: "§6" },
        // The card's Kills and Deaths under its Against Wool Holder and As Wool Holder headings.
        killsOnWoolHolder: { colour: "§a", label: "stats.kills" },
        deathsToWoolHolder: { colour: "§c", label: "stats.deaths" },
        killsAsWoolHolder: { colour: "§a", label: "stats.kills" },
        deathsAsWoolHolder: { colour: "§c", label: "stats.deaths" },
      },
    },
  ],
};
