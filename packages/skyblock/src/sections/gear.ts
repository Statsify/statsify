/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { TUNING } from "./accessories.js";
import { decodeSlots } from "#items";
import { removeFormatting } from "@statsify/util";
import type { GearSection, ItemView, Loadout, Slots } from "#types";
import type { RawMember, RawNbt } from "#raw";

const ARMOR_PIECES = ["HELMET", "CHESTPLATE", "LEGGINGS", "BOOTS"] as const;

const EQUIPMENT_PIECES = [
  "EQUIPMENT_SLOT_1",
  "EQUIPMENT_SLOT_2",
  "EQUIPMENT_SLOT_3",
  "EQUIPMENT_SLOT_4",
] as const;

// The rarity line ends with the item type, as in "EPIC BOW".
const WEAPON_LINE = /\b(?:SWORD|LONGSWORD|BOW|GAUNTLET|WAND)$/;

export const isWeapon = (item: ItemView) =>
  WEAPON_LINE.test(removeFormatting(item.lore.at(-1) ?? "").trim());

interface SavedSets<Piece extends string> {
  equipped_set?: number;
  [slot: `${number}`]: Partial<Record<Piece, RawNbt>>;
}

function getSavedSets<Piece extends string>(
  { equipped_set: wornSlot, ...saved }: SavedSets<Piece>,
  pieces: Piece[],
  worn: Slots,
) {
  const sets = Object.entries(saved)
    .map(([slot, set]) => ({
      slot: Number(slot),
      // The worn set's pieces are on the player, not in its slot.
      items:
        Number(slot) === wornSlot
          ? worn
          : pieces.map((piece) => {
              const blob = set[piece];
              return blob ? (decodeSlots(blob)[0] ?? null) : null;
            }),
    }))
    .filter(({ items }) => items.some(Boolean))
    .toSorted((a, b) => a.slot - b.slot);
  return { sets, wornSlot };
}

function getWardrobe(
  member: RawMember,
  worn: Slots,
): Pick<GearSection, "wardrobe" | "wardrobeSlot"> {
  const loadout = member.loadout?.armor;

  if (loadout) {
    const { sets, wornSlot } = getSavedSets(loadout, [...ARMOR_PIECES], worn);
    const wardrobe = sets.map(({ slot, items }) => ({ slot, armor: items }));
    return { wardrobe, wardrobeSlot: wornSlot };
  }

  const equipped = member.inventory?.wardrobe_equipped_slot;
  const wardrobeSlot =
    equipped !== undefined && equipped > 0 ? equipped : undefined;

  const contents = member.inventory?.wardrobe_contents;
  if (!contents) return { wardrobe: [], wardrobeSlot };

  // Old saves keep pages of 36, with a set in each column of nine.
  const slots = decodeSlots(contents);
  const wardrobe: GearSection["wardrobe"] = [];
  for (let page = 0; page * 36 < slots.length; page++) {
    for (let column = 0; column < 9; column++) {
      const armor = ARMOR_PIECES.map(
        (_, row) => slots[page * 36 + row * 9 + column] ?? null,
      );
      if (armor.some(Boolean))
        wardrobe.push({ slot: page * 9 + column + 1, armor });
    }
  }
  return { wardrobe, wardrobeSlot };
}

function getEquipmentSets(
  member: RawMember,
  worn: Slots,
): Pick<GearSection, "equipmentSets" | "equipmentSlot"> {
  const { sets, wornSlot } = getSavedSets(
    member.loadout?.equipment ?? {},
    [...EQUIPMENT_PIECES],
    worn,
  );
  const equipmentSets = sets.map(({ slot, items }) => ({
    slot,
    equipment: items,
  }));
  return { equipmentSets, equipmentSlot: wornSlot };
}

function getLoadoutTuning(points: unknown) {
  if (!points || typeof points !== "object") return;

  // A tuning slot keeps its purchase_ts beside the points.
  const stats = Object.entries(points as Record<string, number>).filter(
    ([key, value]) => key in TUNING && value > 0,
  );
  return stats.length > 0 ? Object.fromEntries(stats) : undefined;
}

function getLoadouts(member: RawMember): Loadout[] {
  const tuning = member.accessory_bag_storage?.tuning ?? {};

  return Object.values(member.loadout?.loadouts ?? {})
    .map((loadout) => {
      const slot = loadout.tuning_points_slot;
      const points = slot === undefined ? undefined : tuning[`slot_${slot}`];
      return {
        id: loadout.id,
        name: loadout.name,
        armorSet: loadout.armor_set_id,
        equipmentSet: loadout.equipment_set_id,
        pet: loadout.pet,
        power: loadout.power_stone,
        tuning: getLoadoutTuning(points),
      };
    })
    .filter(({ armorSet, equipmentSet, pet, power, tuning }) =>
      [armorSet, equipmentSet, pet, power, tuning].some(
        (value) => value !== undefined,
      ),
    )
    .toSorted((a, b) => a.id - b.id);
}

export function getGear(member: RawMember): GearSection | null {
  const inventory = member.inventory;
  if (!inventory?.inv_contents) return null;

  // The armor inventory runs from the boots up.
  const armor = inventory.inv_armor
    ? decodeSlots(inventory.inv_armor).toReversed()
    : [null, null, null, null];

  const equipment = inventory.equipment_contents
    ? decodeSlots(inventory.equipment_contents)
    : [null, null, null, null];

  return {
    armor,
    equipment,
    ...getWardrobe(member, armor),
    ...getEquipmentSets(member, equipment),
    weapons: decodeSlots(inventory.inv_contents).filter(
      (item): item is ItemView => item !== null && isWeapon(item),
    ),
    loadouts: getLoadouts(member),
  };
}
