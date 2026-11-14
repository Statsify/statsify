/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { decodeSlots } from "#items";
import { removeFormatting } from "@statsify/util";
import type { GearSection, ItemView, Slots } from "#types";
import type { RawMember } from "#raw";

const ARMOR_PIECES = ["HELMET", "CHESTPLATE", "LEGGINGS", "BOOTS"] as const;

// The item type ends an item's rarity line: "LEGENDARY DUNGEON SWORD", "EPIC BOW"
const WEAPON_LINE = /\b(?:SWORD|LONGSWORD|BOW|GAUNTLET|WAND)$/;

export const isWeapon = (item: ItemView) => WEAPON_LINE.test(removeFormatting(item.lore.at(-1) ?? "").trim());

/**
 * Each set with anything in it, by slot, and the worn set's slot. Old saves keep pages of 36 (four rows of nine, a set
 * per column).
 */
function getWardrobe(member: RawMember, worn: Slots): Pick<GearSection, "wardrobe" | "wardrobeSlot"> {
  const loadout = member.loadout?.armor;

  if (loadout) {
    const { equipped_set: wardrobeSlot, ...sets } = loadout;
    const wardrobe = Object.entries(sets)
      .map(([slot, set]) => ({
        slot: Number(slot),
        // The worn set's slot holds only its id, since its pieces are on the player
        armor: Number(slot) === wardrobeSlot ? worn : ARMOR_PIECES.map((piece) => {
          const blob = set[piece];
          return blob ? (decodeSlots(blob)[0] ?? null) : null;
        }),
      }))
      .filter(({ armor }) => armor.some(Boolean))
      .toSorted((a, b) => a.slot - b.slot);
    return { wardrobe, wardrobeSlot };
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

/** What the member wears and keeps in the wardrobe, and the weapons in their inventory. */
export function getGear(member: RawMember): GearSection | null {
  const inventory = member.inventory;
  if (!inventory?.inv_contents) return null;

  // The armor inventory runs from the boots up
  const armor = inventory.inv_armor ? decodeSlots(inventory.inv_armor).toReversed() : [null, null, null, null];

  return {
    armor,
    equipment: inventory.equipment_contents ? decodeSlots(inventory.equipment_contents) : [null, null, null, null],
    ...getWardrobe(member, armor),
    weapons: decodeSlots(inventory.inv_contents).filter((item): item is ItemView => item !== null && isWeapon(item)),
  };
}
