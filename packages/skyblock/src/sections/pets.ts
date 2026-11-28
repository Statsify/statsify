/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { boostedRarity, getPetLevel, getPetScore } from "#leveling";
import { add } from "@statsify/math";
import {
  RARITIES,
  type ItemsResource,
  type PetView,
  type PetsSection,
} from "#types";
import { getPetName } from "#data";
import { getPetTexture, resourceTexture } from "#textures";
import type { RawMember, RawPet } from "#raw";

function toPetView(pet: RawPet, items: ItemsResource | undefined): PetView {
  const rarity = boostedRarity(pet);
  const heldItem = pet.heldItem ? items?.items[pet.heldItem] : undefined;

  return {
    uuid: pet.uuid ?? undefined,
    type: pet.type,
    name: getPetName(pet.type),
    rarity,
    level: getPetLevel(pet, rarity),
    heldItem: pet.heldItem ?? undefined,
    heldItemTexture: heldItem && resourceTexture(heldItem),
    skin: pet.skin ?? undefined,
    candyUsed: pet.candyUsed ?? 0,
    active: pet.active,
    texture: getPetTexture(pet.type, rarity, { skin: pet.skin, items }),
  };
}

export function getPets(member: RawMember, items?: ItemsResource): PetsSection {
  const raw = [...(member.pets_data?.pets ?? [])];
  // The Rift keeps Montezuma apart, and its active means summoned there.
  const montezuma = member.rift?.dead_cats?.montezuma;
  if (montezuma) raw.push({ ...montezuma, active: false });

  const pets = raw
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
    totalXp: member.player_stats?.pets?.total_exp_gained ?? 0,
    skinned: pets.filter(({ skin }) => skin).length,
    candyUsed: add(...pets.map(({ candyUsed }) => candyUsed)),
  };
}
