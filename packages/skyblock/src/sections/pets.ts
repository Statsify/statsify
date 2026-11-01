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
import { resourceTexture } from "#textures";
import type { RawMember, RawPet } from "#raw";

export const PET_RARITIES = RARITIES.slice(0, 6);
const rank = (rarity: Rarity) => RARITIES.indexOf(rarity);

export const petName = (type: string) => PETS.id_to_display_name[type] ?? prettify(type);

/** A Tier Boost raises the rarity, and with it the XP table the level reads. */
export function boostedRarity(pet: RawPet) {
  const base = pet.tier as Rarity;
  // A boost never makes a pet Mythic, except the Bingo pet (the wiki's Tier Boost page, unverified)
  const highest = pet.type === "BINGO" ? "MYTHIC" : "LEGENDARY";
  return pet.heldItem === "PET_ITEM_TIER_BOOST" && rank(base) < rank(highest) ? PET_RARITIES[rank(base) + 1] : base;
}

export const petMaxLevel = (type: string) => PETS.custom_pet_leveling[type]?.max_level ?? 100;

/** 99 levels from the rarity's offset, plus custom pets' extra levels (Golden Dragon to 200). */
export function getPetLevel(pet: RawPet, rarity = boostedRarity(pet)): Level {
  const custom = PETS.custom_pet_leveling[pet.type] ?? {};
  const offset = custom.rarity_offset?.[rarity] ?? PETS.pet_rarity_offset[rarity];
  const maxLevel = petMaxLevel(pet.type);
  const table = [...PETS.pet_levels.slice(offset, offset + 99), ...(custom.pet_levels ?? [])];
  const level = getLevel(pet.exp, table, maxLevel - 1);
  return { ...level, level: level.level + 1, maxLevel };
}

/** The items resource covers skins newer than the NEU pin; a type falls back to its nearest rarity's head. */
export function petTexture(type: string, rarity: Rarity, skin?: string | null, items?: ItemsResource): ItemTexture {
  const skinned = skin && (PET_TEXTURES.skins[skin] ?? items?.items[`PET_SKIN_${skin}`]?.skin);
  if (skinned) return { kind: "head", skin: skinned };

  const textures = PET_TEXTURES.pets[type] ?? {};
  const nearest = RARITIES.toSorted((a, b) => Math.abs(rank(a) - rank(rarity)) - Math.abs(rank(b) - rank(rarity)));
  const hash = nearest.map((candidate) => textures[candidate]).find(Boolean);
  // A type newer than the pin has no head: show the bare skull item.
  return hash ? { kind: "head", skin: hash } : { kind: "item", id: 397, damage: 3 };
}

function toPetView(pet: RawPet, items: ItemsResource | undefined): PetView {
  const rarity = boostedRarity(pet);
  const heldResource = pet.heldItem ? items?.items[pet.heldItem] : undefined;

  return {
    uuid: pet.uuid ?? undefined,
    type: pet.type,
    name: petName(pet.type),
    rarity,
    level: getPetLevel(pet, rarity),
    heldItem: pet.heldItem ?? undefined,
    heldItemTexture: heldResource && resourceTexture(heldResource),
    skin: pet.skin ?? undefined,
    candyUsed: pet.candyUsed ?? 0,
    active: pet.active,
    texture: petTexture(pet.type, rarity, pet.skin, items),
  };
}

/** A tier's pet score points: Common 1 … Mythic 6, and 0 for the tiers that never count. */
export const petScorePoints = (tier: string) => PET_RARITIES.indexOf(tier as Rarity) + 1;

/**
 * Pet score: one pet per type counts, the one with the best rarity, Tier Boost included (the wiki's Rift Ferret page,
 * unverified), then the highest level. It scores Common 1 … Mythic 6, plus 1 if it's at max level. Special and Very
 * Special pets never count. Pets are sorted active first, then by rarity and XP.
 *
 * Montezuma lives in the Rift's dead_cats, where its active flag means summoned in the Rift. It's listed but doesn't
 * score: counting it would put members above their highest_pet_score.
 */
export function getPets(member: RawMember, items?: ItemsResource): PetsSection {
  const views: PetView[] = [];
  const best = new Map<string, { points: number; level: PetView["level"] }>();

  for (const pet of member.pets_data?.pets ?? []) {
    const view = toPetView(pet, items);
    views.push(view);

    const points = petScorePoints(view.rarity);
    if (points === 0) continue;

    const { level } = view;
    const seen = best.get(pet.type);
    if (!seen || points > seen.points || (points === seen.points && level.level > seen.level.level))
      best.set(pet.type, { points, level });
  }

  const montezuma = member.rift?.dead_cats?.montezuma;
  if (montezuma) views.push(toPetView({ ...montezuma, active: false }, items));

  const pets = views.toSorted(
    (a, b) => Number(b.active) - Number(a.active) || rank(b.rarity) - rank(a.rarity) || b.level.xp - a.level.xp
  );

  return {
    score: add(...Array.from(best.values(), ({ points, level }) => points + Number(level.level === level.maxLevel))),
    active: pets.find((pet) => pet.active),
    pets,
    totalXp: member.player_stats?.pets?.total_exp_gained ?? 0,
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
    // The boosted Bee scores Legendary, Jerry its Mythic over its maxed Common, and Phoenix never scores
    expect(score).toBe(5 + 5 + 6);
  });
}
