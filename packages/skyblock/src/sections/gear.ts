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

const isWeapon = (item: ItemView) => WEAPON_LINE.test(removeFormatting(item.lore.at(-1) ?? "").trim());

// 1.8 numbers armor from 298, a helmet to boots run per material in this order
const FIRST_ARMOR_ID = 298;
const ARMOR_MATERIALS = ["leather", "chainmail", "iron", "diamond", "gold"] as const;
const SKIN_SLOTS = ["helmet", "chestplate", "leggings", "boots"] as const;

// 1.8's mob skulls (item 397) by damage; 3 is the player head
const SKULL_ID = 397;
const SKULLS = ["skeleton", "wither_skeleton", "zombie", undefined, "creeper"] as const;

type SkinArmorPiece =
  | { material: (typeof ARMOR_MATERIALS)[number]; color?: number; enchanted: boolean }
  | { head: string }
  | { skull: NonNullable<(typeof SKULLS)[number]> };

export type SkinArmor = Partial<Record<(typeof SKIN_SLOTS)[number], SkinArmorPiece>>;

/** Worn armor, helmet to boots, as the /skin route's armor JSON. Anything else in a slot is left off. */
function skinArmor(armor: Slots): SkinArmor {
  const pieces = armor.map((item, slot): SkinArmorPiece | undefined => {
    if (!item) return;
    const { texture } = item;
    if (texture.kind === "head") return slot === 0 ? { head: texture.skin } : undefined;

    const skull = slot === 0 && texture.id === SKULL_ID ? SKULLS[texture.damage] : undefined;
    if (skull) return { skull };

    const offset = texture.id - FIRST_ARMOR_ID;
    const material = offset % 4 === slot ? ARMOR_MATERIALS[Math.floor(offset / 4)] : undefined;
    return material && { material, color: texture.color, enchanted: item.glint };
  });

  return Object.fromEntries(SKIN_SLOTS.map((slot, index) => [slot, pieces[index]]));
}

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

// The armor inventory runs from the boots up
const wornArmor = (inventory: NonNullable<RawMember["inventory"]>): Slots =>
  inventory.inv_armor ? decodeSlots(inventory.inv_armor).toReversed() : [null, null, null, null];

/** The worn armor for the player's skin. */
export function getArmor(member: RawMember): SkinArmor | null {
  const inventory = member.inventory;
  return inventory?.inv_contents ? skinArmor(wornArmor(inventory)) : null;
}

/** What the member wears and keeps in the wardrobe, and the weapons in their inventory. */
export function getGear(member: RawMember): GearSection | null {
  const inventory = member.inventory;
  if (!inventory?.inv_contents) return null;

  const armor = wornArmor(inventory);

  return {
    armor,
    equipment: inventory.equipment_contents ? decodeSlots(inventory.equipment_contents) : [null, null, null, null],
    ...getWardrobe(member, armor),
    weapons: decodeSlots(inventory.inv_contents).filter((item): item is ItemView => item !== null && isWeapon(item)),
  };
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  const item = { id: "", name: "", lore: [], count: 1, glint: false, recombobulated: false };

  test("skinArmor maps 1.8 armor ids, textured heads and mob skulls, leaving off anything else", () => {
    expect(skinArmor([
      { ...item, texture: { kind: "head", skin: "abc123" } },
      { ...item, glint: true, texture: { kind: "item", id: 299, damage: 0, color: 0xFF_00_00 } },
      { ...item, texture: { kind: "item", id: 316, damage: 0 } },
      { ...item, texture: { kind: "item", id: 313, damage: 0 } },
    ])).toEqual({
      helmet: { head: "abc123" },
      chestplate: { material: "leather", color: 0xFF_00_00, enchanted: true },
      leggings: { material: "gold", enchanted: false },
      boots: { material: "diamond", enchanted: false },
    });

    // A zombie skull, boots worn as a chestplate, a creeper skull below the helmet, and an empty slot
    expect(skinArmor([
      { ...item, texture: { kind: "item", id: 397, damage: 2 } },
      { ...item, texture: { kind: "item", id: 301, damage: 0 } },
      { ...item, texture: { kind: "item", id: 397, damage: 4 } },
      null,
    ])).toEqual({ helmet: { skull: "zombie" } });

    // A player head without a texture
    expect(skinArmor([{ ...item, texture: { kind: "item", id: 397, damage: 3 } }, null, null, null])).toEqual({});
  });
}
