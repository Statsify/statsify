/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { ItemStack } from "../core/item-stack.js";
import dumped from "../../data/quake.json" with { type: "json" };
import { kitKey } from "./kits.js";

// The gun's parts (sight is its laser), then the hat and the armour, as the Quake stats keys name them
const LOADOUT = ["case", "barrel", "trigger", "muzzle", "sight", "hat", "armor", "leggings", "boots"] as const;

type QuakePart = (typeof LOADOUT)[number];

// Built by scripts/import-dump.ts from the Quakecraft Shop's menus
const PARTS = dumped as Record<QuakePart, Record<string, ItemStack>>;

// Ids are the menu's name without its last word, some with a word of their own: LARGE_BALL is
// the Large Barrel, lantern and discohat the Lantern and Disco Hats, disco_leggings the Disco Pants
const partKey = (id: string) => kitKey(id).replace(/(ball|hat|kit|leggings|boots)$/, "");

/**
 * A Quake loadout from the Quake stats ({ case: "SHINY_DIAMOND_HOE", barrel: "LARGE_BALL" }) as a
 * row of the shop's items: case, barrel, trigger, muzzle, laser, hat, chestplate, leggings, boots.
 * A part that isn't picked, or that the shop's menus don't match, leaves its slot empty.
 */
export function fromQuakeLoadout(quake: Readonly<Partial<Record<QuakePart, string | null>>>): (ItemStack | undefined)[] {
  return LOADOUT.map((part) => {
    const id = quake[part];
    return id ? PARTS[part][partKey(id)] : undefined;
  });
}
