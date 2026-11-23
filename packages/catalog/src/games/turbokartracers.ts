/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { TURBO_KART_RACERS_MODES, type TurboKartRacersModes } from "@statsify/schemas";
import type { Game } from "../catalog.js";

/** The colors and labels of the bot's Turbo Kart Racers card (`turbokartracers.profile.tsx`): its sidebar and table. */
export const TURBO_KART_RACERS: Game<TurboKartRacersModes> = {
  key: "turbokartracers",
  id: "TURBO_KART_RACERS",
  modes: TURBO_KART_RACERS_MODES,
  game: {
    coins: { color: "§6" },
    tokens: { color: "§e" },
    boxesPickedUp: { color: "§c" },
    grandPrixTokens: { color: "§b" },
    lapsCompleted: { color: "§2" },
    goldRate: { color: "§6", suffix: "%" },
    trophyRate: { color: "§b", suffix: "%" },
    gamesPlayed: { color: "§a" },
    // The trophies in their metals' colors. Gold trophies also set the prefix.
    gold: { color: "§#ffd700", label: "stats.goldTrophies" },
    silver: { color: "§#c0c0c0", label: "stats.silverTrophies" },
    bronze: { color: "§#cd7f32", label: "stats.bronzeTrophies" },
    total: { color: "§a", label: "stats.totalTrophies" },
    // On neither the card nor a leaderboard, so no page shows it.
    coinsPickedUp: { color: "§6" },
  },
  shapes: [],
};
