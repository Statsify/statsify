/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { TURBO_KART_RACERS_MODES, type TurboKartRacersModes } from "@statsify/schemas";
import type { Game } from "../catalog.js";

/** The colours and labels of the bot's Turbo Kart Racers card (`turbokartracers.profile.tsx`): its sidebar and table. */
export const TURBO_KART_RACERS: Game<TurboKartRacersModes> = {
  key: "turbokartracers",
  id: "TURBO_KART_RACERS",
  modes: TURBO_KART_RACERS_MODES,
  game: {
    coins: { colour: "§6" },
    tokens: { colour: "§e" },
    boxesPickedUp: { colour: "§c" },
    grandPrixTokens: { colour: "§b" },
    lapsCompleted: { colour: "§2" },
    goldRate: { colour: "§6", suffix: "%" },
    trophyRate: { colour: "§b", suffix: "%" },
    gamesPlayed: { colour: "§a" },
    // The trophies in their metals' colours. Gold trophies also set the prefix.
    gold: { colour: "§#ffd700", label: "stats.goldTrophies" },
    silver: { colour: "§#c0c0c0", label: "stats.silverTrophies" },
    bronze: { colour: "§#cd7f32", label: "stats.bronzeTrophies" },
    total: { colour: "§a", label: "stats.totalTrophies" },
    // On neither the card nor a leaderboard, so no page shows it.
    coinsPickedUp: { colour: "§6" },
  },
  shapes: [],
};
