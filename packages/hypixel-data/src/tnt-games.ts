/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ARMOR, inRange } from "./kits.js";
import type { ItemStack } from "@statsify/textures";
import dumped from "../data/tnt-games.json" with { type: "json" };

export interface TntGamesMode {
  name: string;
  tokens: Record<string, ItemStack>;
  default: Record<string, string>;
}

// Built by scripts/import-dump.ts from the game's layout editors
const MODES = dumped as Record<string, TntGamesMode>;

/** TNT Games' modes as the TNTGames stats key each layout (tntrun, spleef), and their names */
export const TNT_GAMES_LAYOUTS = Object.entries(MODES).map(
  ([key, { name }]) => ({ key, name }),
);

/**
 * A TNT Games layout, like TNTGames.tntrun ({ "0": "double_jump", "1": "speed_potion" }), as 36
 * player inventory slots. Without one, it's the layout a player who never saved one sees.
 */
export function fromTntGamesLayout(
  stored: Readonly<Record<string, string>> | null | undefined,
  key: string,
): (ItemStack | undefined)[] {
  const mode = MODES[key];
  if (!mode) throw new Error(`No TNT Games layout ${key}`);

  // No armor, so the slots end where it would start
  const slots: (ItemStack | undefined)[] = Array.from({ length: ARMOR.boots });

  for (const [slot, token] of Object.entries(stored ?? mode.default)) {
    if (!inRange(Number(slot), slots.length)) continue;

    const item = mode.tokens[token];
    if (!item) throw new Error(`No TNT Games ${key} item ${token}`);
    slots[Number(slot)] = item;
  }

  return slots;
}
