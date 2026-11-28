/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { PETS } from "#data";
import { PET_RARITIES, boostedRarity, getPetLevel } from "#leveling";
import {
  RARITIES,
  type ItemsResource,
  type PetView,
  type PetsSection,
  type Rarity,
} from "#types";
import { add } from "@statsify/math";
import { getPetTexture } from "#textures";
import { prettify } from "@statsify/util";
import type { RawMember, RawPet } from "#raw";

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
    texture: getPetTexture(pet, rarity, items),
  };
}

// Common scores 1 up to Mythic's 6, and every other tier 0.
export const petScorePoints = (tier: string) =>
  PET_RARITIES.indexOf(tier as Rarity) + 1;

export function getPets(member: RawMember, items?: ItemsResource): PetsSection {
  const raw = member.pets_data?.pets ?? [];
  const views = raw.map((pet) => toPetView(pet, items));

  // The score ranks each type's pets by the API's tier, without Tier Boost.
  const best = new Map<string, { points: number; level: PetView["level"] }>();
  for (const [i, pet] of raw.entries()) {
    const points = petScorePoints(pet.tier);
    if (points === 0) continue;

    const { level } = views[i];
    const seen = best.get(pet.type);
    if (
      !seen ||
      points > seen.points ||
      (points === seen.points && level.level > seen.level.level)
    )
      best.set(pet.type, { points, level });
  }

  const pets = views.toSorted(
    (a, b) =>
      Number(b.active) - Number(a.active) ||
      RARITIES.indexOf(b.rarity) - RARITIES.indexOf(a.rarity) ||
      b.level.xp - a.level.xp,
  );

  return {
    score: add(
      ...Array.from(
        best.values(),
        ({ points, level }) => points + Number(level.level === level.maxLevel),
      ),
    ),
    active: pets.find((pet) => pet.active),
    pets,
  };
}
