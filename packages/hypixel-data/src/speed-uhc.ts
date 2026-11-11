/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { ItemStack } from "@statsify/textures";
import dumped from "../data/speed-uhc.json" with { type: "json" };
import { kitKey } from "./kits.js";

// Built by scripts/import-dump.ts from the Speed UHC Shop's Kits page and the Gear Selector's
// Default kit, by mode and kit
const KITS = dumped as Record<string, Record<string, (ItemStack | null)[]>>;

/**
 * A Speed UHC kit by its activeKit_<MODE> id, like kit_basic_normal_logger, as a row of its items
 * in the Kits page's order, with their counts and enchantments. An item the page names in
 * Hypixel's words (Pig Egg, Awkward Potion) leaves its slot empty.
 */
export function fromSpeedUhcKit(id: string): (ItemStack | undefined)[] {
  const [, mode, name] = /^kit_basic_([a-z]+)_(.+)$/.exec(id) ?? [];
  const kit = mode && name ? KITS[mode]?.[kitKey(name)] : undefined;
  if (!kit) throw new Error(`No Speed UHC kit ${id}`);
  return kit.map((item) => item ?? undefined);
}
