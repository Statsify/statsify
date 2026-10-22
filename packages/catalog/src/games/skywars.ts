/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ChallengesSkyWars, SKYWARS_MODES, type SkyWarsModes, scanMetadata } from "@statsify/schemas";
import { type Game, doneColour, selection } from "../catalog.js";

/** The challenges card's wins (`skywars-challenges.profile.tsx`), in the schema's order as the card lists them. */
export const SKYWARS_CHALLENGES = scanMetadata(ChallengesSkyWars).map(([key]) => `challenges.${key}`);

/** The colours and labels of the bot's SkyWars cards (`skywars.profile.tsx` and its challenges card). */
export const SKYWARS: Game<SkyWarsModes> = {
  key: "skywars",
  id: "SKYWARS",
  modes: SKYWARS_MODES,
  game: {
    // The level's leaderboard ranks EXP, as BedWars' does.
    exp: { colour: "§b" },
    coins: { colour: "§6" },
    tokens: { colour: "§2" },
    souls: { colour: "§b" },
    opals: { colour: "§9" },
    heads: { colour: "§5" },
    potionsBrewed: { colour: "§d" },
    ...Object.fromEntries(SKYWARS_CHALLENGES.map((key) => [key, { colour: doneColour }])),
  },
  shapes: [
    {
      modes: ["overall", "solo", "doubles", "mini"],
      stats: {
        wins: { colour: "§a" },
        losses: { colour: "§c" },
        wlr: { colour: "§6" },
        kills: { colour: "§a" },
        deaths: { colour: "§c" },
        kdr: { colour: "§6" },
        assists: { colour: "§a" },
        playtime: { colour: "§c" },
        // The site's addition, in Games Played's colour on the other cards.
        gamesPlayed: { colour: "§e" },
        // Hypixel sends the Normal and Insane kits; the schema keeps the one the player has more wins with.
        kit: selection("§6"),
      },
    },
  ],
};
