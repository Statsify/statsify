/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { PETS, PET_TEXTURES } from "#data";
import { RARITIES, type ItemTexture, type ItemsResource, type PetView, type PetsSection, type Rarity } from "#types";
import { add } from "@statsify/math";
import { getLevel } from "#leveling";
import { prettify } from "@statsify/util";
import type { RawMember, RawPet } from "#raw";

const PET_RARITIES = RARITIES.slice(0, 6);
const rank = (rarity: Rarity) => RARITIES.indexOf(rarity);

/** 99 levels from the rarity's offset, plus custom pets' extra levels (Golden Dragon to 200). */
function petLevel(pet: RawPet, rarity: Rarity) {
  const custom = PETS.custom_pet_leveling[pet.type] ?? {};
  const offset = custom.rarity_offset?.[rarity] ?? PETS.pet_rarity_offset[rarity];
  const maxLevel = custom.max_level ?? 100;
  const table = [...PETS.pet_levels.slice(offset, offset + 99), ...(custom.pet_levels ?? [])];
  const level = getLevel(pet.exp, table, maxLevel - 1);
  return { ...level, level: level.level + 1, maxLevel };
}

/** The items resource covers skins newer than the NEU pin; a type falls back to its nearest rarity's head. */
function petTexture(pet: RawPet, rarity: Rarity, items: ItemsResource | undefined): ItemTexture {
  const skin = pet.skin && (PET_TEXTURES.skins[pet.skin] ?? items?.items[`PET_SKIN_${pet.skin}`]?.skin);
  if (skin) return { kind: "head", skin };

  const textures = PET_TEXTURES.pets[pet.type] ?? {};
  const nearest = RARITIES.toSorted((a, b) => Math.abs(rank(a) - rank(rarity)) - Math.abs(rank(b) - rank(rarity)));
  const hash = nearest.map((candidate) => textures[candidate]).find(Boolean);
  // A type newer than the pin has no head: show the bare skull item.
  return hash ? { kind: "head", skin: hash } : { kind: "item", id: 397, damage: 3 };
}

function toPetView(pet: RawPet, items: ItemsResource | undefined): PetView {
  const base = pet.tier as Rarity;
  // A Tier Boost raises the rarity, and with it the XP table the level reads.
  const rarity = pet.heldItem === "PET_ITEM_TIER_BOOST" ? (PET_RARITIES[rank(base) + 1] ?? base) : base;

  return {
    uuid: pet.uuid ?? undefined,
    type: pet.type,
    name: PETS.id_to_display_name[pet.type] ?? prettify(pet.type),
    rarity,
    level: petLevel(pet, rarity),
    heldItem: pet.heldItem ?? undefined,
    skin: pet.skin ?? undefined,
    candyUsed: pet.candyUsed ?? 0,
    active: pet.active,
    texture: petTexture(pet, rarity, items),
  };
}

/** A tier's pet score points: Common 1 … Mythic 6, and 0 for the tiers that never count. */
export const petScorePoints = (tier: string) => PET_RARITIES.indexOf(tier as Rarity) + 1;

/** Pet score: each type's best pet by the API's tier (which leaves out Tier Boost), then level, plus 1 at max level. */
export function getPets(member: RawMember, items?: ItemsResource): PetsSection {
  const raw = member.pets_data?.pets ?? [];
  const views = raw.map((pet) => toPetView(pet, items));

  const best = new Map<string, { points: number; level: PetView["level"] }>();
  for (const [i, pet] of raw.entries()) {
    const points = petScorePoints(pet.tier);
    if (points === 0) continue;

    const { level } = views[i];
    const seen = best.get(pet.type);
    if (!seen || points > seen.points || (points === seen.points && level.level > seen.level.level))
      best.set(pet.type, { points, level });
  }

  const pets = views.toSorted(
    (a, b) => Number(b.active) - Number(a.active) || rank(b.rarity) - rank(a.rarity) || b.level.xp - a.level.xp
  );

  return {
    score: add(...Array.from(best.values(), ({ points, level }) => points + Number(level.level === level.maxLevel))),
    active: pets.find((pet) => pet.active),
    pets,
  };
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("getPets levels by rarity, Tier Boost and custom tables, and scores each type's best pet", () => {
    const { score, active, pets } = getPets({
      pets_data: {
        pets: [
          { type: "BEE", tier: "EPIC", exp: 20_000_000, heldItem: "PET_ITEM_TIER_BOOST", active: true },
          { type: "BEE", tier: "EPIC", exp: 20_000_000, active: false },
          { type: "GOLDEN_DRAGON", tier: "LEGENDARY", exp: 25_353_230, active: false },
          { type: "PHOENIX", tier: "VERY_SPECIAL", exp: 1e9, active: false },
          { type: "JERRY", tier: "MYTHIC", exp: 1_000_000, active: false },
          { type: "JERRY", tier: "COMMON", exp: 1e9, active: false },
        ],
      },
    });

    expect(active).toMatchObject({ rarity: "LEGENDARY", level: { level: 96, maxLevel: 100 } });
    expect(pets.find((pet) => !pet.active && pet.type === "BEE")?.level.level).toBe(100);
    expect(pets.find((pet) => pet.type === "GOLDEN_DRAGON")?.level).toMatchObject({ level: 100, maxLevel: 200 });
    // Jerry scores its Mythic over its maxed Common, and Phoenix never scores
    expect(score).toBe(4 + 1 + 5 + 6);
  });
}
