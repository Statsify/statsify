/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FormattedGame, type GameId } from "@statsify/schemas";
import { removeFormatting } from "@statsify/util";

/** The site's spelling of the games the bot joins into one word ("MegaWalls"): spaced, like "Arena Brawl". */
const SPACED_GAMES = new Map<GameId, string>([
  ["BLITZSG", "§2Blitz §6SG§f"],
  ["MEGAWALLS", "§7Mega Walls§f"],
  ["SPEED_UHC", "§bSpeed §6UHC§f"],
  ["WOOLGAMES", "§cWool §9Games§f"],
]);

/**
 * Each joined spelling the schemas build names from, with the site's: a game's colored and plain name, and the
 * WoolGames modes its leaderboard names join (its mode registry spaces them).
 */
const SPACED: [joined: string, spaced: string][] = [
  ...[...SPACED_GAMES].flatMap(([game, spaced]): [string, string][] => [
    [FormattedGame[game], spaced],
    [removeFormatting(FormattedGame[game]), removeFormatting(spaced)],
  ]),
  ["WoolWars", "Wool Wars"],
  ["SheepWars", "Sheep Wars"],
];

/**
 * A name built from game and mode names (a leaderboard's, a mode's, a stat's) as the site spells it. The bot's cards
 * keep their joined spelling, so only the site's names go through this, never a player's.
 */
export const siteName = (name: string): string =>
  SPACED.reduce((spelled, [joined, spaced]) => spelled.replaceAll(joined, spaced), name);

/** A game's colored name, spelled as the site spells it. */
export const gameName = (game: GameId): string => SPACED_GAMES.get(game) ?? FormattedGame[game];

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe("siteName", () => {
    it("spaces the joined game and mode names, colored or not, and nothing else", () => {
      expect(siteName("§cWool§9Games§f")).toBe("§cWool §9Games§f");
      expect(siteName("§7MegaWalls§f Challenges - Wither")).toBe("§7Mega Walls§f Challenges - Wither");
      expect(siteName("Duels - BlitzSG Wins")).toBe("Duels - Blitz SG Wins");
      expect(siteName("BedWars, SkyWars, SpeedWalls")).toBe("BedWars, SkyWars, SpeedWalls");
      expect(siteName("Woolgamesfan")).toBe("Woolgamesfan");
    });
  });
}
