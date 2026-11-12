/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FormattedGame, PARKOUR_MODES, Parkour, type ParkourModes, scanMetadata } from "@statsify/schemas";
import type { Game, StatEntry } from "../catalog.js";

/**
 * The bot's Parkour card (`parkour.profile.tsx`): each lobby's best time under its game's name, in white, and N/A for a
 * lobby never finished. The times are the leaderboards' formatter's.
 */
export const PARKOUR: Game<ParkourModes> = {
  key: "parkour",
  id: "PARKOUR",
  modes: PARKOUR_MODES,
  game: Object.fromEntries(
    scanMetadata(Parkour).map(([lobby]): [string, StatEntry] => [
      lobby,
      { color: "§f", name: FormattedGame[lobby as keyof typeof FormattedGame], unset: "N/A" },
    ])
  ),
  shapes: [],
};
