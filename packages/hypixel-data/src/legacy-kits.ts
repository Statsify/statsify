/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type ItemStack, legacyMaterialId } from "@statsify/textures";
import { SLOTS, hypixelItem, inRange, kitKey } from "./kits.js";
import { findArmor } from "./armor.js";
import dumped from "../data/legacy-kits.json" with { type: "json" };

export interface LegacyKit {
  name: string;
  level: number;
  items: { slot: number; token: string; item: ItemStack }[];
  armor?: Record<string, ItemStack>;
  saved?: true;
}

type Game = "blitz" | "megawalls";

// Built by scripts/import-dump.ts from the game's layout editors
const KITS = dumped as Record<Game, Record<string, LegacyKit>>;

const BLITZ_ARMOR = dumped.blitzArmor as Record<
  string,
  Record<string, ItemStack>[]
>;

const withDefaults = (game: Game) =>
  Object.values(KITS[game])
    .filter(({ saved }) => !saved)
    .map(({ name, level }) => ({ name, level }));

export const BLITZ_KITS = withDefaults("blitz");

export const MEGA_WALLS_KITS = withDefaults("megawalls");

// Walls' InventoryLayout2 adds each item's name, or NONAME
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

export function blitzKitArmor(kit: string, level: number) {
  const armor = BLITZ_ARMOR[kitKey(kit)]?.[level - 1];
  return armor && findArmor(Object.values(armor));
}

export function megaWallsKitArmor(kit: string, level: number) {
  const dumpedKit = KITS.megawalls[kitKey(kit)];
  return dumpedKit?.level === level
    ? findArmor(Object.values(dumpedKit.armor ?? {}))
    : undefined;
}

export const fromBlitzKit = (
  stored: Readonly<Record<string, string>> | null | undefined,
  kit: string,
  level: number,
  renames?: Readonly<Record<string, string>>,
) => fromDumpedKit("blitz", stored, kit, level, renames);

export const fromMegaWallsKit = (
  stored: Readonly<Record<string, string>> | null | undefined,
  kit: string,
  level: number,
) => fromDumpedKit("megawalls", stored, kit, level);
