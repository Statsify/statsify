/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { PETS, PET_TEXTURES } from "#data";
import { RARITIES, type ItemTexture, type ItemsResource, type Level, type PetView, type PetsSection, type Rarity } from "#types";
import { add } from "@statsify/math";
import { getLevel } from "#leveling";
import { prettify } from "@statsify/util";
import type { RawMember, RawPet } from "#raw";

const PET_RARITIES = RARITIES.slice(0, 6);
const rank = (rarity: Rarity) => RARITIES.indexOf(rarity);

/** A Tier Boost raises the rarity, and with it the XP table the level reads. */
function boostedRarity(pet: RawPet) {
  const base = pet.tier as Rarity;
  // A boost never makes a pet Mythic, except the Bingo pet (the wiki's Tier Boost page, unverified)
  const highest = pet.type === "BINGO" ? "MYTHIC" : "LEGENDARY";
  return pet.heldItem === "PET_ITEM_TIER_BOOST" && rank(base) < rank(highest) ? PET_RARITIES[rank(base) + 1] : base;
}

/** 99 levels from the rarity's offset, plus custom pets' extra levels (Golden Dragon to 200). */
export function getPetLevel(pet: RawPet, rarity = boostedRarity(pet)): Level {
  const custom = PETS.custom_pet_leveling[pet.type] ?? {};
  const own = custom.rarity_offset ?? {};
  // Bingo's own offsets stop at Legendary, below the Mythic a Tier Boost gives it, so its highest one carries on
  const highest = PET_RARITIES.findLast((candidate) => candidate in own);
  const offset = own[rarity] ?? (highest ? own[highest] : PETS.pet_rarity_offset[rarity]);
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
  const rarity = boostedRarity(pet);

  return {
    uuid: pet.uuid ?? undefined,
    type: pet.type,
    name: PETS.id_to_display_name[pet.type] ?? prettify(pet.type),
    rarity,
    level: getPetLevel(pet, rarity),
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
    const bingo = { type: "BINGO", tier: "LEGENDARY", exp: 5_624_785, heldItem: "PET_ITEM_TIER_BOOST", active: false };
    expect(getPetLevel(bingo).level).toBe(100);
    // Jerry scores its Mythic over its maxed Common, and Phoenix never scores
    expect(score).toBe(4 + 1 + 5 + 6);
  });
}
