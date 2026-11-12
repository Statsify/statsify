/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { CHALLENGE_MODES, type ChallengeModes, Challenges, scanMetadata } from "@statsify/schemas";
import { type Game, type Shape, childClasses } from "../catalog.js";
import { prettify } from "@statsify/util";

/**
 * The bot's `/challenges` card (`challenges.profile.tsx`): the total in §b, each game's total in §a, and its challenges
 * under their leaderboard names, colored by rank where they're shown.
 */
export const CHALLENGES: Game<ChallengeModes> = {
  key: "challenges",
  id: null,
  modes: CHALLENGE_MODES,
  game: { total: { colour: "§b", glossary: "challengesTotal" } },
  // Each game's challenges class, whose own metadata holds the names the card shows (the player's are prefixed).
  shapes: childClasses(Challenges).map(([game, type]): Shape => ({
    modes: [game],
    stats: Object.fromEntries(
      scanMetadata(type).map(([key, { leaderboard }]) => [
        key,
        key === "total" ? { color: "§a", glossary: "challengesTotal" } : { color: "§a", name: leaderboard.name ?? prettify(key) },
      ])
    ),
  })),
};
