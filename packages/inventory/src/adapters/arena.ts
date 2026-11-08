/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { ItemStack } from "../core/item-stack.js";
import dumped from "../../data/arena.json" with { type: "json" };
import { kitKey } from "./kits.js";

const LOADOUT = ["offensive", "utility", "support", "ultimate", "active_rune"] as const;

type ArenaSlot = (typeof LOADOUT)[number];

// Built by scripts/import-dump.ts from the Arena Shop's skill and rune menus
const MENUS = dumped as Record<ArenaSlot, Record<string, ItemStack>>;

// Hypixel stores berserk as bersek, and the Rune of Defence as tank, as its rune_level_tank key does
const RENAMED: Record<string, string> = { bersek: "berserk", tank: "defence" };

/**
 * An Arena loadout from the Arena stats ({ offensive: "falcon_punch", active_rune: "damage" }) as a
 * row of the shop's items: the offensive, utility, support and ultimate skills, then the rune. A
 * skill that isn't picked, or that the menus don't list, leaves its slot empty.
 */
export function fromArenaLoadout(arena: Readonly<Partial<Record<ArenaSlot, string | null>>>): (ItemStack | undefined)[] {
  return LOADOUT.map((slot) => {
    const id = arena[slot];
    return id ? MENUS[slot][kitKey(RENAMED[id] ?? id)] : undefined;
  });
}
