/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ChallengesSkyWars, SKYWARS_MODES, type SkyWarsModes, scanMetadata } from "@statsify/schemas";
import { type Game, doneColor, selection } from "../catalog.js";

/** The challenges card's wins (`skywars-challenges.profile.tsx`), in the schema's order as the card lists them. */
export const SKYWARS_CHALLENGES = scanMetadata(ChallengesSkyWars).map(([key]) => `challenges.${key}`);

/** The colors and labels of the bot's SkyWars cards (`skywars.profile.tsx` and its challenges card). */
export const SKYWARS: Game<SkyWarsModes> = {
  key: "skywars",
  id: "SKYWARS",
  modes: SKYWARS_MODES,
  game: {
    // The level's leaderboard ranks EXP, as BedWars' does.
    exp: { color: "§b" },
    coins: { color: "§6" },
    tokens: { color: "§2" },
    souls: { color: "§b" },
    opals: { color: "§9" },
    heads: { color: "§5" },
    potionsBrewed: { color: "§d" },
    ...Object.fromEntries(SKYWARS_CHALLENGES.map((key) => [key, { color: doneColor }])),
  },
  shapes: [
    {
      modes: ["overall", "solo", "doubles", "mini"],
      stats: {
        wins: { color: "§a" },
        losses: { color: "§c" },
        wlr: { color: "§6" },
        kills: { color: "§a" },
        deaths: { color: "§c" },
        kdr: { color: "§6" },
        assists: { color: "§a" },
        playtime: { color: "§c" },
        // The site's addition, in Games Played's color on the other cards.
        gamesPlayed: { color: "§e" },
        // Hypixel sends the Normal and Insane kits; the schema keeps the one the player has more wins with.
        kit: selection("§6"),
      },
    },
  ],
};
