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

// The rarity line ends with the item type, as in "EPIC BOW".
const WEAPON_LINE = /\b(?:SWORD|LONGSWORD|BOW|GAUNTLET|WAND)$/;

// 1.8 numbers armor from 298, helmet to boots for each material in turn.
const FIRST_ARMOR_ID = 298;
const ARMOR_MATERIALS = [
  "leather",
  "chainmail",
  "iron",
  "diamond",
  "gold",
] as const;
const SKIN_SLOTS = ["helmet", "chestplate", "leggings", "boots"] as const;

// 1.8's mob skulls by damage, where 3 is the player head.
const SKULL_ID = 397;
const SKULLS = [
  "skeleton",
  "wither_skeleton",
  "zombie",
  undefined,
  "creeper",
] as const;

type SkinArmorPiece =
  | {
      material: (typeof ARMOR_MATERIALS)[number];
      color?: number;
      enchanted: boolean;
    }
  | { head: string }
  | { skull: NonNullable<(typeof SKULLS)[number]> };

export type SkinArmor = Partial<
  Record<(typeof SKIN_SLOTS)[number], SkinArmorPiece>
>;

// The /skin route draws only these, so anything else in a slot is left off.
function toSkinArmor(armor: Slots): SkinArmor {
  const pieces = armor.map((item, slot): SkinArmorPiece | undefined => {
    if (!item) return;

    const { texture } = item;
    if (texture.kind === "head") {
      return slot === 0 ? { head: texture.skin } : undefined;
    }

    const isSkull = slot === 0 && texture.id === SKULL_ID;
    const skull = isSkull ? SKULLS[texture.damage] : undefined;
    if (skull) return { skull };

    const offset = texture.id - FIRST_ARMOR_ID;
    if (offset % 4 !== slot) return;

    const material = ARMOR_MATERIALS[Math.floor(offset / 4)];
    return (
      material && { material, color: texture.color, enchanted: item.glint }
    );
  });

  return Object.fromEntries(
    SKIN_SLOTS.map((slot, index) => [slot, pieces[index]]),
  );
}

function getWardrobe(
  member: RawMember,
  worn: Slots,
): Pick<GearSection, "wardrobe" | "wardrobeSlot"> {
  const loadout = member.loadout?.armor;

  if (loadout) {
    const { equipped_set: wardrobeSlot, ...sets } = loadout;
    const wardrobe = Object.entries(sets)
      .map(([slot, set]) => ({
        slot: Number(slot),
        // The worn set's pieces are on the player, not in its slot.
        armor:
          Number(slot) === wardrobeSlot
            ? worn
            : ARMOR_PIECES.map((piece) => {
                const blob = set[piece];
                return blob ? (decodeSlots(blob)[0] ?? null) : null;
              }),
      }))
      .filter(({ armor }) => armor.some(Boolean))
      .toSorted((a, b) => a.slot - b.slot);
    return { wardrobe, wardrobeSlot };
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

// The armor inventory runs from the boots up.
const getWornArmor = (inventory: NonNullable<RawMember["inventory"]>): Slots =>
  inventory.inv_armor
    ? decodeSlots(inventory.inv_armor).toReversed()
    : [null, null, null, null];

export function getArmor(member: RawMember): SkinArmor | null {
  const inventory = member.inventory;
  if (!inventory?.inv_contents) return null;
  return toSkinArmor(getWornArmor(inventory));
}

export function getGear(member: RawMember): GearSection | null {
  const inventory = member.inventory;
  if (!inventory?.inv_contents) return null;

  const armor = getWornArmor(inventory);

  return {
    armor,
    equipment: inventory.equipment_contents
      ? decodeSlots(inventory.equipment_contents)
      : [null, null, null, null],
    ...getWardrobe(member, armor),
    weapons: decodeSlots(inventory.inv_contents).filter(
      (item): item is ItemView =>
        item !== null &&
        WEAPON_LINE.test(removeFormatting(item.lore.at(-1) ?? "").trim()),
    ),
  };
}

if (import.meta.vitest) {
  const { suite, it, expect } = import.meta.vitest;

  const item = {
    id: "",
    name: "",
    lore: [],
    count: 1,
    glint: false,
    recombobulated: false,
  };

  suite("toSkinArmor", () => {
    it("should map 1.8 armor ids, textured heads and mob skulls", () => {
      expect(
        toSkinArmor([
          { ...item, texture: { kind: "head", skin: "abc123" } },
          {
            ...item,
            glint: true,
            texture: { kind: "item", id: 299, damage: 0, color: 0xff_00_00 },
          },
          { ...item, texture: { kind: "item", id: 316, damage: 0 } },
          { ...item, texture: { kind: "item", id: 313, damage: 0 } },
        ]),
      ).toEqual({
        helmet: { head: "abc123" },
        chestplate: { material: "leather", color: 0xff_00_00, enchanted: true },
        leggings: { material: "gold", enchanted: false },
        boots: { material: "diamond", enchanted: false },
      });
    });

    it("should leave off a piece in the wrong slot or a bare player head", () => {
      expect(
        toSkinArmor([
          { ...item, texture: { kind: "item", id: 397, damage: 2 } },
          { ...item, texture: { kind: "item", id: 301, damage: 0 } },
          { ...item, texture: { kind: "item", id: 397, damage: 4 } },
          null,
        ]),
      ).toEqual({ helmet: { skull: "zombie" } });

      expect(
        toSkinArmor([
          { ...item, texture: { kind: "item", id: 397, damage: 3 } },
          null,
          null,
          null,
        ]),
      ).toEqual({});
    });
  });
}
