/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ARMOR, SLOTS, hypixelItem, inRange, kitKey } from "./kits.js";
import { type ItemStack, legacyMaterialId } from "@statsify/textures";
import { findArmor } from "./armor.js";
import dumped from "../data/duels-modes.json" with { type: "json" };

export interface KitItem {
  slot: number;
  material: string;
  shared?: boolean;
  item: ItemStack;
}

export interface Kit {
  name: string;
  items: KitItem[];
  armor?: Record<string, ItemStack>;
}

// Built by scripts/import-dump.ts from the game's layout editors
const MODES = dumped.modes as Record<string, Record<string, ItemStack>>;
const DEFAULTS = dumped.defaults as Record<string, Record<string, string>>;
const KITS = dumped.kits as Record<string, Record<string, Kit>>;

const SHARED = Object.fromEntries(
  Object.entries(KITS).map(([mode, kits]) => {
    const byMaterial = new Map<string, ItemStack>();
    for (const { material, shared, item } of Object.values(kits).flatMap(
      (kit) => kit.items,
    )) {
      if (shared && !byMaterial.has(material)) byMaterial.set(material, item);
    }
    return [mode, byMaterial];
  }),
);

const KIT_MODES = ["mw_duel", "blitz_duel", "sw_duel"] as const;
const KIT_MODE_KEY = new RegExp(`^(${KIT_MODES.join("|")})_(.+)$`);

// Their look depends on a Damage value the token doesn't carry
const DAMAGE_DEPENDENT = new Set(["potion", "monster_egg"]);

function duelsMode(key: string) {
  const name = key.replace(/^layout_/, "");
  const kit = KIT_MODE_KEY.exec(name);
  return kit
    ? { mode: kit[1], kit: kit[2] }
    : { mode: name.replace(/_layout$/, "") };
}

export const DUELS_DEFAULT_KEYS = Object.keys(DEFAULTS).map(
  (mode) => `layout_${mode}_layout`,
);

export const DUELS_KITS = Object.entries(KITS).flatMap(([mode, kits]) =>
  Object.entries(kits).map(([kit, { name }]) => ({
    key: `layout_${mode}_${kit}`,
    name,
  })),
);

function duelsKit(mode: string, kit: string): Kit | undefined {
  const kits = KITS[mode];
  if (!kits) return undefined;
  if (kits[kit]) return kits[kit];
  if (mode !== "sw_duel") return kits[kitKey(kit)];

  // Mini's and Ranked's SkyWars Duel keys name the Mini picker's kits
  const id = /^kit_([a-z]+)_([a-z]+)_(.+)$/.exec(kit);
  const name = kitKey(id?.[3] ?? kit);
  if (!id) return kits[`mini_${name}`] ?? kits[`insane_${name}`];
  return kits[
    `${id[1] === "mini" || id[2] === "ranked" ? "mini" : "insane"}_${name}`
  ];
}

export function duelsKitArmor(mode: (typeof KIT_MODES)[number], kit: string) {
  const armor = duelsKit(mode, kit)?.armor;
  return armor && findArmor(Object.values(armor));
}

const withoutCopy = (token: string) => token.replace(/_?\d+$/, "");
const copyNumber = (token: string) => Number(/(\d+)$/.exec(token)?.[1] ?? 0);
// Blitz's Shadow Knight and Shark wear a skull their editors leave out
const armorSlot = (material: string) =>
  material === "skull_item"
    ? ARMOR.helmet
    : Object.entries(ARMOR).find(([piece]) =>
        material.endsWith(`_${piece}`),
      )?.[1];

function endingMaterial(token: string) {
  const words = withoutCopy(token).split("_");
  return words
    .map((_, start) => words.slice(start).join("_"))
    .find(
      (material) =>
        DAMAGE_DEPENDENT.has(material) ||
        legacyMaterialId(material.toUpperCase()) !== undefined,
    );
}

const bukkitItem = (material: string) =>
  DAMAGE_DEPENDENT.has(material)
    ? undefined
    : hypixelItem(legacyMaterialId(material.toUpperCase())!);

export function fromDuelsKit(
  stored: Readonly<Record<string, string>> | null | undefined,
  key: string,
): (ItemStack | undefined)[] | undefined {
  const slots: (ItemStack | undefined)[] = Array.from({ length: SLOTS });
  const { mode, kit: name } = duelsMode(key);
  const kit = name ? duelsKit(mode, name) : undefined;

  // The game puts on the kit's armor whatever the layout holds
  for (const [slot, item] of Object.entries(kit?.armor ?? {}))
    slots[Number(slot)] = item;

  if (!stored && kit) {
    for (const { slot, item } of kit.items) slots[slot] = item;
    return slots;
  }

  const layout = stored ?? DEFAULTS[mode];
  if (!layout) return;

  const entries: [number, string][] = [];
  for (const [slot, token] of Object.entries(layout))
    if (token && inRange(Number(slot), ARMOR.boots))
      entries.push([Number(slot), token]);

  const own = (token: string) =>
    name && token.startsWith(`${name}_`)
      ? token.slice(name.length + 1)
      : undefined;
  const material = (token: string) => withoutCopy(own(token) ?? token);

  for (const [slot, token] of entries) {
    const tokenMaterial = material(token);

    // Layouts saved before the editor hid armor still hold it
    const worn = armorSlot(tokenMaterial);
    if (
      worn !== undefined &&
      !kit?.items.some((candidate) => candidate.material === tokenMaterial)
    ) {
      const ending = endingMaterial(token);
      if (ending) slots[worn] ??= bukkitItem(ending);
      continue;
    }

    let item: ItemStack | undefined = MODES[mode]?.[withoutCopy(token)];

    if (!item && kit) {
      const isOwn = own(token) !== undefined;
      const same = kit.items.filter(
        (candidate) => candidate.material === tokenMaterial,
      );
      const pool = same.filter(
        (candidate) => Boolean(candidate.shared) !== isOwn,
      );
      const numbers = entries
        .filter(
          ([, other]) =>
            (own(other) !== undefined) === isOwn &&
            material(other) === tokenMaterial,
        )
        .map(([, other]) => copyNumber(other))
        .toSorted((a, b) => a - b);
      item = (pool.length > 0 ? pool : same)[numbers.indexOf(copyNumber(token))]
        ?.item;
    }

    item ??= SHARED[mode]?.get(tokenMaterial);

    if (!item) {
      const ending = endingMaterial(token);
      if (ending === undefined)
        throw new Error(`No Duels item or Bukkit material for ${token}`);
      item = bukkitItem(ending);
    }

    if (item) slots[slot] = item;
  }

  return slots;
}
