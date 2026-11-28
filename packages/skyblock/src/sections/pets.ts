/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { boostedRarity, getPetLevel, getPetScore } from "#leveling";
import {
  RARITIES,
  type ItemsResource,
  type PetView,
  type PetsSection,
} from "#types";
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
