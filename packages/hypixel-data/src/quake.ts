/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { ItemStack } from "@statsify/textures";
import dumped from "../data/quake.json" with { type: "json" };
import { kitKey } from "./kits.js";

const LOADOUT = [
  "case",
  "barrel",
  "trigger",
  "muzzle",
  "sight",
  "hat",
  "armor",
  "leggings",
  "boots",
] as const;

type QuakePart = (typeof LOADOUT)[number];

// Built by scripts/import-dump.ts from the Quakecraft Shop's menus
const PARTS = dumped as Record<QuakePart, Record<string, ItemStack>>;

// Keys are the menu's name less its last word, which stored ids may swap
const QUAKEZODIA = { exodia: "quakezodia" };

// By part, since the laser keeps GOLD where the muzzle's is the Golden Muzzle
const RENAMED: Partial<Record<QuakePart, Record<string, string | undefined>>> =
  {
    muzzle: { gold: "golden", none: "no", wood: "wooden" },
    hat: QUAKEZODIA,
    armor: QUAKEZODIA,
    leggings: QUAKEZODIA,
    boots: QUAKEZODIA,
  };

const partKey = (part: QuakePart, id: string) => {
  const key = kitKey(id).replace(/(ball|hat|kit|leggings|boots)+$/, "");
  return RENAMED[part]?.[key] ?? key;
};

export function fromQuakeLoadout(
  quake: Readonly<Partial<Record<QuakePart, string | null>>>,
): (ItemStack | undefined)[] {
  return LOADOUT.map((part) => {
    const id = quake[part];
    return id ? PARTS[part][partKey(part, id)] : undefined;
  });
}
