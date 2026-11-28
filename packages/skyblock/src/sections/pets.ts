/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { PET_RARITIES, boostedRarity, getPetLevel } from "#leveling";
import {
  RARITIES,
  type ItemsResource,
  type PetView,
  type PetsSection,
  type Rarity,
} from "#types";
import { add } from "@statsify/math";
import { getPetName } from "#data";
import { getPetTexture } from "#textures";
import type { RawMember, RawPet } from "#raw";

function toPetView(pet: RawPet, items: ItemsResource | undefined): PetView {
  const rarity = boostedRarity(pet);

  return {
    uuid: pet.uuid ?? undefined,
    type: pet.type,
    name: getPetName(pet.type),
    rarity,
    level: getPetLevel(pet, rarity),
    heldItem: pet.heldItem ?? undefined,
    skin: pet.skin ?? undefined,
    candyUsed: pet.candyUsed ?? 0,
    active: pet.active,
    texture: getPetTexture(pet.type, rarity, { skin: pet.skin, items }),
  };
}

// Common scores 1 up to Mythic's 6, and every other tier 0.
export const getPetScorePoints = (tier: string) =>
  PET_RARITIES.indexOf(tier as Rarity) + 1;

export function getPetScore(member: RawMember) {
  // The score ranks each type's pets by the API's tier, without Tier Boost.
  const best = new Map<string, { points: number; level: PetView["level"] }>();
  for (const pet of member.pets_data?.pets ?? []) {
    const points = getPetScorePoints(pet.tier);
    if (points === 0) continue;

    const level = getPetLevel(pet);
    const seen = best.get(pet.type);
    if (
      !seen ||
      points > seen.points ||
      (points === seen.points && level.level > seen.level.level)
    ) {
      best.set(pet.type, { points, level });
    }
  }

  return add(
    ...Array.from(
      best.values(),
      ({ points, level }) => points + Number(level.level === level.maxLevel),
    ),
  );
}

export function getPets(member: RawMember, items?: ItemsResource): PetsSection {
  const pets = (member.pets_data?.pets ?? [])
    .map((pet) => toPetView(pet, items))
    .toSorted(
      (a, b) =>
        Number(b.active) - Number(a.active) ||
        RARITIES.indexOf(b.rarity) - RARITIES.indexOf(a.rarity) ||
        b.level.xp - a.level.xp,
    );

  return {
    score: getPetScore(member),
    active: pets.find((pet) => pet.active),
    pets,
  };
}
