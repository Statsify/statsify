/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { ItemStack } from "@statsify/textures";
import dumped from "../data/arena.json" with { type: "json" };
import { kitKey } from "./kits.js";

const LOADOUT = [
  "offensive",
  "utility",
  "support",
  "ultimate",
  "active_rune",
] as const;

type ArenaSlot = (typeof LOADOUT)[number];

// Built by scripts/import-dump.ts from the Arena Shop's skill and rune menus
const MENUS = dumped as Record<ArenaSlot, Record<string, ItemStack>>;

// Hypixel stores berserk as bersek, Petrify as polymorph, the Rune of Defence as tank (as its
// rune_level_tank key does), and some skills by shorter names than the shop's
const RENAMED: Record<string, string | undefined> = {
  arachnid: "broodmother",
  bersek: "berserk",
  charge: "bullcharge",
  polymorph: "petrify",
  rocket_pig: "guidedpig",
  shotgun: "cookieshotgun",
  tank: "defence",
};

/** An Arena loadout ({ offensive: "falcon_punch", active_rune: "damage" }) as the shop's items in LOADOUT's order */
export function fromArenaLoadout(
  arena: Readonly<Partial<Record<ArenaSlot, string | null>>>,
): (ItemStack | undefined)[] {
  return LOADOUT.map((slot) => {
    const id = arena[slot];
    if (!id) return undefined;

    const item = MENUS[slot][kitKey(RENAMED[id] ?? id)];
    if (!item) throw new Error(`No Arena ${slot} ${id}`);
    return item;
  });
}
