/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type ItemStack, legacyMaterialId } from "@statsify/textures";
import { SLOTS, hypixelItem, inRange, kitKey } from "./kits.js";
import { armorOf } from "./armor.js";
import dumped from "../data/legacy-kits.json" with { type: "json" };

export interface LegacyKit {
  /** As its editor's title names it, like Hype Train */
  name: string;
  /** The level the editor was dumped at: a Blitz kit's (1 to 10) or a Mega Walls Kit upgrade (1 to 5) */
  level: number;
  /** Each item by its "id,damage" token, in the slot the editor showed it */
  items: { slot: number; token: string; item: ItemStack }[];
  /** The armor the game equips, by armor slot */
  armor?: Record<string, ItemStack>;
  /** The editor showed a layout the dumping account had saved, so its slots aren't the default */
  saved?: true;
}

type Game = "blitz" | "megawalls";

// Built by scripts/import-dump.ts from the game's layout editors
const KITS = dumped as Record<Game, Record<string, LegacyKit>>;

// Each Blitz kit's armor by level, I to X, from its Upgrades page
const BLITZ_ARMOR = dumped.blitzArmor as Record<
  string,
  Record<string, ItemStack>[]
>;

const withDefaults = (game: Game) =>
  Object.values(KITS[game]).flatMap(({ name, level, saved }) =>
    saved ? [] : [{ name, level }],
  );

/** Every Blitz kit with a default layout, and the level it's for */
export const BLITZ_KITS = withDefaults("blitz");

/** Every Mega Walls class with a default layout, and the Kit upgrade it's for */
export const MEGA_WALLS_KITS = withDefaults("megawalls");

/**
 * A layout of 1.8 "id,damage" values by slot ({ "0": "267,0" }), as Blitz, Mega Walls and Walls store kits.
 * Walls' InventoryLayout2 adds each item's name, or NONAME ({ "12": "273,0,§bSpeedy Spade" })
 */
export function fromLegacyKit(
  layout: Readonly<Record<string, string>>,
): (ItemStack | undefined)[] {
  const slots: (ItemStack | undefined)[] = Array.from({ length: SLOTS });

  for (const [slot, value] of Object.entries(layout)) {
    const [id, damage, ...rest] = value.split(",");
    const item = hypixelItem(Number(id), Number(damage));
    const name = rest.join(",");
    if (inRange(Number(slot), SLOTS))
      slots[Number(slot)] =
        item && name && name !== "NONAME" ? { ...item, name } : item;
  }

  return slots;
}

function fromDumpedKit(
  game: Game,
  stored: Readonly<Record<string, string>> | null | undefined,
  name: string,
  level: number,
  renames: Readonly<Record<string, string>> = {},
): (ItemStack | undefined)[] | undefined {
  const kit = KITS[game][kitKey(name)];
  const dumpedAtLevel = kit?.level === level ? kit : undefined;

  const layout =
    stored ??
    (dumpedAtLevel && !dumpedAtLevel.saved
      ? Object.fromEntries(
          dumpedAtLevel.items.map(({ slot, token }) => [slot, token]),
        )
      : undefined);
  if (!layout) return;

  const renamed = new Map(
    Object.entries(renames).map(([material, rename]) => [
      legacyMaterialId(material.toUpperCase()),
      rename,
    ]),
  );
  const slots = fromLegacyKit(layout);

  for (const [slot, token] of Object.entries(layout)) {
    const index = Number(slot);
    if (!inRange(index, SLOTS)) continue;
    const item =
      dumpedAtLevel?.items.find((candidate) => candidate.token === token)
        ?.item ?? slots[index];
    if (!item) continue;

    const rename = renamed.get(Number(token.split(",")[0]));
    slots[index] = rename ? { ...item, name: rename } : item;
  }

  for (const [slot, item] of Object.entries(dumpedAtLevel?.armor ?? {}))
    slots[Number(slot)] = item;

  return slots;
}

/** A Blitz kit's armor at a level (1 to 10), from its Upgrades page */
export function blitzKitArmor(kit: string, level: number) {
  const armor = BLITZ_ARMOR[kitKey(kit)]?.[level - 1];
  return armor && armorOf(Object.values(armor));
}

/** A Mega Walls class's armor at a Kit upgrade level, which is only known at the level its editor was dumped at */
export function megaWallsKitArmor(kit: string, level: number) {
  const dumpedKit = KITS.megawalls[kitKey(kit)];
  return dumpedKit?.level === level
    ? armorOf(Object.values(dumpedKit.armor ?? {}))
    : undefined;
}

/**
 * A Blitz <Kit>Inventory, or the kit's default (undefined for a kit or level the dump lacks), with the dumped counts,
 * names and tooltips only at its editor's level. `renames` holds kit_item_rename_<Kit>_<material> ({ gold_sword: "§9Excalibur" })
 */
export const fromBlitzKit = (
  stored: Readonly<Record<string, string>> | null | undefined,
  kit: string,
  level: number,
  renames?: Readonly<Record<string, string>>,
) => fromDumpedKit("blitz", stored, kit, level, renames);

/** A Mega Walls <class>Inventory by Kit upgrade level, as fromBlitzKit, with the class's armor at its editor's level */
export const fromMegaWallsKit = (
  stored: Readonly<Record<string, string>> | null | undefined,
  kit: string,
  level: number,
) => fromDumpedKit("megawalls", stored, kit, level);
