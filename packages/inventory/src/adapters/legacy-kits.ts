/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { SLOTS, fromLegacyKit, inRange, kitKey } from "./kits.js";
import type { ItemStack } from "../core/item-stack.js";
import { armorOf } from "./armor.js";
import data from "../../data/minecraft-data.json" with { type: "json" };
import dumped from "../../data/legacy-kits.json" with { type: "json" };

export interface LegacyKit {
  /** As its editor's title names it, like Hype Train */
  name: string;
  /**
   * The level the editor was dumped at: a Blitz kit's (1 to 10) or a Mega Walls class's Kit
   * upgrade (1 to 5). Counts, names, enchantments and wear change with it
   */
  level: number;
  /** Each item by its "id,damage" token, in the slot the editor showed it */
  items: { slot: number; token: string; item: ItemStack }[];
  /** The armour the game equips, by armour slot */
  armor?: Record<string, ItemStack>;
  /** The editor showed a layout the dumping account had saved, so its slots aren't the default */
  saved?: true;
}

type Game = "blitz" | "megawalls";

// Built by scripts/import-dump.ts from the game's layout editors
const KITS = dumped as Record<Game, Record<string, LegacyKit>>;

const materials: Record<string, number | undefined> = data.materials;

const withDefaults = (game: Game) =>
  Object.values(KITS[game]).flatMap(({ name, level, saved }) => (saved ? [] : [{ name, level }]));

/** Every Blitz kit with a default layout, and the level it's for */
export const BLITZ_KITS = withDefaults("blitz");

/** Every Mega Walls class with a default layout, and the Kit upgrade it's for */
export const MEGA_WALLS_KITS = withDefaults("megawalls");

function fromDumpedKit(
  game: Game,
  stored: Readonly<Record<string, string>> | null | undefined,
  name: string,
  level: number,
  renames: Readonly<Record<string, string>> = {},
): (ItemStack | undefined)[] {
  const kit = KITS[game][kitKey(name)];
  const dumpedAtLevel = kit?.level === level ? kit : undefined;

  const layout =
    stored ??
    (dumpedAtLevel && !dumpedAtLevel.saved
      ? Object.fromEntries(dumpedAtLevel.items.map(({ slot, token }) => [slot, token]))
      : undefined);
  if (!layout) throw new Error(`No default ${game} layout for ${name} at level ${level}`);

  const renamed = new Map(Object.entries(renames).map(([material, rename]) => [materials[material.toUpperCase()], rename]));
  const slots = fromLegacyKit(layout);

  for (const [slot, token] of Object.entries(layout)) {
    const index = Number(slot);
    if (!inRange(index, SLOTS)) continue;
    const item = dumpedAtLevel?.items.find((candidate) => candidate.token === token)?.item ?? slots[index];
    if (!item) continue;

    const rename = renamed.get(Number(token.split(",")[0]));
    slots[index] = rename ? { ...item, name: rename } : item;
  }

  for (const [slot, item] of Object.entries(dumpedAtLevel?.armor ?? {})) slots[Number(slot)] = item;

  return slots;
}

// Blitz's editors hold its armour among the items, and Mega Walls' class pages list theirs
function dumpedKitArmor(game: Game, name: string, level: number) {
  const kit = KITS[game][kitKey(name)];
  if (kit?.level !== level) return undefined;
  return armorOf([...Object.values(kit.armor ?? {}), ...kit.items.map(({ item }) => item)]);
}

/** A Blitz kit's armour at a level, which is only known at the level its editor was dumped at */
export const blitzKitArmor = (kit: string, level: number) => dumpedKitArmor("blitz", kit, level);

/** A Mega Walls class's armour at a Kit upgrade level, which is only known at the level its editor was dumped at */
export const megaWallsKitArmor = (kit: string, level: number) => dumpedKitArmor("megawalls", kit, level);

/**
 * A Blitz <Kit>Inventory ({ "0": "345,0", "1": "261,0" }) as 40 player inventory slots, or
 * without one the kit's default. At the level the kit's editor was dumped at, items get the
 * game's counts, names and tooltips; at others they're plain. `renames` holds the player's
 * kit_item_rename_<Kit>_<material> names by material, like { gold_sword: "§9Excalibur" }.
 */
export const fromBlitzKit = (
  stored: Readonly<Record<string, string>> | null | undefined,
  kit: string,
  level: number,
  renames?: Readonly<Record<string, string>>,
) => fromDumpedKit("blitz", stored, kit, level, renames);

/**
 * A Mega Walls <class>Inventory as 40 player inventory slots, or without one the class's
 * default, by the class's Kit upgrade level. At the level its editor was dumped at, items get
 * the game's counts, names and tooltips, and the class's armour is put on; at others they're plain.
 */
export const fromMegaWallsKit = (
  stored: Readonly<Record<string, string>> | null | undefined,
  kit: string,
  level: number,
) => fromDumpedKit("megawalls", stored, kit, level);
