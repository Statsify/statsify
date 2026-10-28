/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FormattedGame, type GameId } from "@statsify/schemas";

/** The bot's joined names, each with the colour code its second word may start with ("§cWool§9Games"). */
const JOINED = /(?<=^|[^A-Za-z]|§[\da-fk-or])(Mega|Speed|Wool|Blitz|Sheep)(§[\da-fk-or])?(Walls|UHC|Games|SG|Wars)(?![a-z])/g;
const SPACED = new Set(["MegaWalls", "SpeedUHC", "WoolGames", "BlitzSG", "WoolWars", "SheepWars"]);

/**
 * A game, mode or leaderboard name as the site spells it: "Mega Walls" and "Wool Games", like "Arena Brawl". The bot's
 * cards keep their joined spelling, so only the site's names go through this, never a player's.
 */
export const siteName = (name: string): string =>
  name.replaceAll(JOINED, (joined, first: string, colour = "", second: string) =>
    SPACED.has(first + second) ? `${first} ${colour}${second}` : joined);

/** A game's coloured name, spelled as the site spells it. */
export const gameName = (game: GameId): string => siteName(FormattedGame[game]);

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe("siteName", () => {
    it("spaces the joined game and mode names, coloured or not, and nothing else", () => {
      expect(siteName("§cWool§9Games§f")).toBe("§cWool §9Games§f");
      expect(siteName("§7MegaWalls§f Challenges - Wither")).toBe("§7Mega Walls§f Challenges - Wither");
      expect(siteName("Duels - BlitzSG Wins")).toBe("Duels - Blitz SG Wins");
      expect(siteName("BedWars, SkyWars, SpeedWalls")).toBe("BedWars, SkyWars, SpeedWalls");
      expect(siteName("Woolgamesfan")).toBe("Woolgamesfan");
    });
  });
}
