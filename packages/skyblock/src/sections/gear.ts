/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { TUNING } from "./accessories.js";
import { byKey } from "./inventories.js";
import { decodeSlots } from "#items";
import { removeFormatting } from "@statsify/util";
import type { GearSection, ItemView, Loadout, Slots } from "#types";
import type { RawMember, RawNbt } from "#raw";

const ARMOR_PIECES = ["HELMET", "CHESTPLATE", "LEGGINGS", "BOOTS"] as const;
export const EQUIPMENT_PIECES = ["EQUIPMENT_SLOT_1", "EQUIPMENT_SLOT_2", "EQUIPMENT_SLOT_3", "EQUIPMENT_SLOT_4"] as const;

// The item type ends an item's rarity line: "LEGENDARY DUNGEON SWORD", "EPIC BOW"
const WEAPON_LINE = /\b(?:SWORD|LONGSWORD|BOW|GAUNTLET|WAND)$/;

export const isWeapon = (item: ItemView) => WEAPON_LINE.test(removeFormatting(item.lore.at(-1) ?? "").trim());

type SavedSets<Piece extends string> = Record<`${number}`, Partial<Record<Piece, RawNbt>>> & { equipped_set?: number };

/** Each saved set with anything in it, by slot, and the worn set's slot. */
function savedSets<Piece extends string>(saved: SavedSets<Piece>, pieces: readonly Piece[], worn: Slots) {
  const { equipped_set: wornSlot, ...sets } = saved;
  const list = Object.entries(sets)
    .map(([slot, set]) => ({
      slot: Number(slot),
      // The worn set's slot holds only its id, since its pieces are on the player
      items: Number(slot) === wornSlot ? worn : pieces.map((piece) => {
        const blob = set[piece];
        return blob ? (decodeSlots(blob)[0] ?? null) : null;
      }),
    }))
    .filter(({ items }) => items.some(Boolean))
    .toSorted((a, b) => a.slot - b.slot);
  return { sets: list, wornSlot };
}

/**
 * Each set with anything in it, by slot, and the worn set's slot. Old saves keep pages of 36 (four rows of nine, a set
 * per column).
 */
function getWardrobe(member: RawMember, worn: Slots): Pick<GearSection, "wardrobe" | "wardrobeSlot"> {
  const loadout = member.loadout?.armor;

  if (loadout) {
    const { sets, wornSlot } = savedSets(loadout, ARMOR_PIECES, worn);
    return { wardrobe: sets.map(({ slot, items }) => ({ slot, armor: items })), wardrobeSlot: wornSlot };
  }

  const equipped = member.inventory?.wardrobe_equipped_slot;
  const wardrobeSlot = equipped !== undefined && equipped > 0 ? equipped : undefined;

  const contents = member.inventory?.wardrobe_contents;
  if (!contents) return { wardrobe: [], wardrobeSlot };

  const slots = decodeSlots(contents);
  const wardrobe: GearSection["wardrobe"] = [];
  for (let page = 0; page * 36 < slots.length; page++) {
    for (let column = 0; column < 9; column++) {
      const armor = ARMOR_PIECES.map((_, row) => slots[page * 36 + row * 9 + column] ?? null);
      if (armor.some(Boolean)) wardrobe.push({ slot: page * 9 + column + 1, armor });
    }
  }
  return { wardrobe, wardrobeSlot };
}

function getEquipmentSets(member: RawMember, worn: Slots): Pick<GearSection, "equipmentSets" | "equipmentSlot"> {
  const { sets, wornSlot } = savedSets(member.loadout?.equipment ?? {}, EQUIPMENT_PIECES, worn);
  return { equipmentSets: sets.map(({ slot, items }) => ({ slot, equipment: items })), equipmentSlot: wornSlot };
}

/**
 * The saved loadouts with anything in them. `tuning_points_slot` n is read as slot_<n>, which the saves' loadout names
 * fit (unverified); a tuning slot also keeps purchase_ts.
 */
function getLoadouts(member: RawMember): Loadout[] {
  const tuning = member.accessory_bag_storage?.tuning ?? {};
  return Object.values(member.loadout?.loadouts ?? {})
    .map(({ id, name, armor_set_id, equipment_set_id, pet, power_stone, tuning_points_slot }) => {
      const points = tuning_points_slot === undefined ? undefined : tuning[`slot_${tuning_points_slot}`];
      const stats =
        points && typeof points === "object" ? Object.entries(points).filter(([key, value]) => key in TUNING && value > 0) : [];
      return {
        id,
        name,
        armorSet: armor_set_id,
        equipmentSet: equipment_set_id,
        pet,
        power: power_stone,
        tuning: stats.length > 0 ? Object.fromEntries(stats) : undefined,
      };
    })
    .filter(({ armorSet, equipmentSet, pet, power, tuning }) =>
      [armorSet, equipmentSet, pet, power, tuning].some((value) => value !== undefined)
    )
    .toSorted((a, b) => a.id - b.id);
}

function getWeapons({ inventory }: RawMember): ItemView[] {
  const blobs = [
    inventory?.inv_contents,
    inventory?.ender_chest_contents,
    ...byKey(inventory?.backpack_contents),
    inventory?.personal_vault_contents,
  ];
  return blobs
    .flatMap((blob) => (blob ? decodeSlots(blob) : []))
    .filter((item): item is ItemView => item !== null && isWeapon(item));
}

/** What the member wears and keeps in the wardrobe, and their weapons. */
export function getGear(member: RawMember): GearSection | null {
  const inventory = member.inventory;
  if (!inventory?.inv_contents) return null;

  // The armor inventory runs from the boots up
  const armor = inventory.inv_armor ? decodeSlots(inventory.inv_armor).toReversed() : [null, null, null, null];

  const equipment = inventory.equipment_contents ? decodeSlots(inventory.equipment_contents) : [null, null, null, null];

  return {
    armor,
    equipment,
    ...getWardrobe(member, armor),
    ...getEquipmentSets(member, equipment),
    weapons: getWeapons(member),
    loadouts: getLoadouts(member),
  };
}
