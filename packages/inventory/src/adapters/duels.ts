/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ARMOR, SLOTS, inRange, kitKey } from "./kits.js";
import type { ItemStack } from "../core/item-stack.js";
import dumped from "../../data/duels-modes.json" with { type: "json" };
import { legacyMaterial } from "../core/legacy-items.js";

export interface KitItem {
  /** Where the game's editor puts it before the player moves anything */
  slot: number;
  /** The Bukkit material its token names, like monster_egg */
  material: string;
  /** Shown in most of the mode's kits, so its token has no kit prefix */
  shared?: boolean;
  item: ItemStack;
}

export interface Kit {
  /** As its picker names it, like Hype Train or Mini Scout */
  name: string;
  items: KitItem[];
  /** The armour its picker lists, by armour slot */
  armor?: Record<string, ItemStack>;
}

// Built by scripts/import-dump.ts from the game's layout editors
const MODES = dumped.modes as Record<string, Record<string, ItemStack>>;
const DEFAULTS = dumped.defaults as Record<string, Record<string, string>>;
const KITS = dumped.kits as Record<string, Record<string, Kit>>;

// Each mode's shared items by material, the first kit's where kits differ
const SHARED = Object.fromEntries(
  Object.entries(KITS).map(([mode, kits]) => {
    const byMaterial = new Map<string, ItemStack>();
    for (const { material, shared, item } of Object.values(kits).flatMap((kit) => kit.items)) {
      if (shared && !byMaterial.has(material)) byMaterial.set(material, item);
    }
    return [mode, byMaterial];
  }),
);

// Modes with a layout per kit, like layout_mw_duel_herobrine
const KIT_MODES = /^(mw_duel|blitz_duel|sw_duel)_(.+)$/;

// Their look depends on a Damage value the token doesn't carry
const DAMAGE_DEPENDENT = new Set(["potion", "monster_egg"]);

/** A layout key's mode and, for modes with one layout per kit, its kit */
function duelsMode(key: string) {
  const name = key.replace(/^layout_/, "");
  const kit = KIT_MODES.exec(name);
  return kit ? { mode: kit[1], kit: kit[2] } : { mode: name.replace(/_layout$/, "") };
}

/** The layout keys of the single-kit modes whose default layout fromDuelsKit knows */
export const DUELS_DEFAULT_KEYS = Object.keys(DEFAULTS).map((mode) => `layout_${mode}_layout`);

/** Every kit with a default layout, by layout key and picker name */
export const DUELS_KITS = Object.entries(KITS).flatMap(([mode, kits]) =>
  Object.entries(kits).map(([kit, { name }]) => ({ key: `layout_${mode}_${kit}`, name })),
);

function duelsKit(mode: string, kit: string): Kit | undefined {
  const kits = KITS[mode];
  if (!kits) return undefined;
  if (kits[kit]) return kits[kit];
  if (mode !== "sw_duel") return kits[kitKey(kit)];

  // SkyWars Duel keys use SkyWars kit ids, kit_<type>_<mode>_<kit>, where Mini's and Ranked's are
  // the Mini picker's kits. Older keys name the kit alone
  const id = /^kit_([a-z]+)_[a-z]+_(.+)$/.exec(kit);
  const name = kitKey(id?.[2] ?? kit);
  if (!id) return kits[`mini_${name}`] ?? kits[`insane_${name}`];
  return kits[`${id[1] === "mini" || id[1] === "ranked" ? "mini" : "insane"}_${name}`];
}

const withoutCopy = (token: string) => token.replace(/_?\d+$/, "");
const copyNumber = (token: string) => Number(/(\d+)$/.exec(token)?.[1] ?? 0);
// Blitz's Shadow Knight and Shark wear a skull, which their editors leave out like armour
const armorSlot = (material: string) =>
  material === "skull_item"
    ? ARMOR.helmet
    : Object.entries(ARMOR).find(([piece]) => material.endsWith(`_${piece}`))?.[1];

// Kit tokens end in a Bukkit material and a number, like hype_train_redstone_torch_on_10
function bukkitItem(token: string) {
  const words = withoutCopy(token).split("_");

  for (let start = 0; start < words.length; start++) {
    const material = words.slice(start).join("_");
    const item = legacyMaterial(material.toUpperCase());
    if (item) return DAMAGE_DEPENDENT.has(material) ? undefined : item;
  }

  return undefined;
}

/** A Duels layout_* object ({ "0": "diamond_sword" }) as 40 player inventory slots, or without one its key's default */
export function fromDuelsKit(
  stored: Readonly<Record<string, string>> | null | undefined,
  key: string,
): (ItemStack | undefined)[] {
  const slots: (ItemStack | undefined)[] = Array.from({ length: SLOTS });
  const { mode, kit: name } = duelsMode(key);
  const kit = name ? duelsKit(mode, name) : undefined;

  // The game puts on the kit's armour whatever the layout holds
  for (const [slot, item] of Object.entries(kit?.armor ?? {})) slots[Number(slot)] = item;

  if (!stored && kit) {
    for (const { slot, item } of kit.items) slots[slot] = item;
    return slots;
  }

  const layout = stored ?? DEFAULTS[mode];
  if (!layout) throw new Error(`No Duels layout for ${key}`);

  const entries = Object.entries(layout).flatMap(([slot, token]) =>
    token && inRange(Number(slot), ARMOR.boots) ? [[Number(slot), token] as const] : [],
  );

  // A kit's token is <kit>_<material>_<n>; a shared item's is just the material
  const own = (token: string) => (name && token.startsWith(`${name}_`) ? token.slice(name.length + 1) : undefined);
  const material = (token: string) => withoutCopy(own(token) ?? token);

  for (const [slot, token] of entries) {
    const tokenMaterial = material(token);

    // Layouts saved before the editor hid armour still hold it, but the game equips it instead
    const worn = armorSlot(tokenMaterial);
    if (worn !== undefined && !kit?.items.some((candidate) => candidate.material === tokenMaterial)) {
      slots[worn] ??= bukkitItem(token);
      continue;
    }

    let item: ItemStack | undefined = MODES[mode]?.[withoutCopy(token)];

    if (!item && kit) {
      // Items of one material match their tokens in order: a kit's by the token's number, which
      // follows the picker's list as the editor's slots do
      const isOwn = own(token) !== undefined;
      const same = kit.items.filter((candidate) => candidate.material === tokenMaterial);
      const pool = same.filter((candidate) => Boolean(candidate.shared) !== isOwn);
      const numbers = entries
        .filter(([, other]) => (own(other) !== undefined) === isOwn && material(other) === tokenMaterial)
        .map(([, other]) => copyNumber(other))
        .toSorted((a, b) => a - b);
      item = (pool.length > 0 ? pool : same)[numbers.indexOf(copyNumber(token))]?.item;
    }

    // A kit the dump doesn't have still shares the mode's items, like SkyWars' iron sword
    item ??= SHARED[mode]?.get(tokenMaterial);
    item ??= bukkitItem(token);
    if (item) slots[slot] = item;
  }

  return slots;
}
