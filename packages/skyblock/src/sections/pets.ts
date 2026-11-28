/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { PET_ITEMS, PET_STATS, PET_TEXTURES, getPetName } from "#data";
import {
  PET_SKIN_PREFIX,
  RARITIES,
  type ItemsResource,
  type PetView,
  type PetsSection,
  type PlayerStat,
  type Stats,
} from "#types";
import { boostedRarity, getPetLevel, getPetScore } from "#leveling";
import { RARITY_COLORS } from "../display.js";
import { add } from "@statsify/math";
import { getPetTexture, resourceTexture } from "#textures";
import { sumStats } from "#lore";
import type { RawMember, RawPet } from "#raw";

function getSkinColor(skin: string, items: ItemsResource | undefined) {
  const color = PET_TEXTURES.skinColors[skin];
  if (color) return color;

  const tier = items?.items[`${PET_SKIN_PREFIX}${skin}`]?.tier;
  return tier && RARITY_COLORS[tier];
}

function toPetView(pet: RawPet, items: ItemsResource | undefined): PetView {
  const rarity = boostedRarity(pet);
  const heldItem = pet.heldItem ? items?.items[pet.heldItem] : undefined;

  return {
    uuid: pet.uuid ?? undefined,
    uniqueId: pet.uniqueId ?? undefined,
    type: pet.type,
    name: getPetName(pet.type),
    rarity,
    level: getPetLevel(pet, rarity),
    heldItem: pet.heldItem ?? undefined,
    heldItemTexture: heldItem && resourceTexture(heldItem),
    skin: pet.skin ?? undefined,
    skinColor: pet.skin ? getSkinColor(pet.skin, items) : undefined,
    candyUsed: pet.candyUsed ?? 0,
    active: pet.active,
    texture: getPetTexture(pet.type, rarity, { skin: pet.skin, items }),
  };
}

function getPetStats(pet: PetView | undefined): Stats | undefined {
  if (!pet) return undefined;

  const table = PET_STATS[pet.type]?.[pet.rarity];
  const item = pet.heldItem ? PET_ITEMS[pet.heldItem] : undefined;
  const [from, to] = table?.levels ?? [1, 100];
  const progress = (Math.min(pet.level.level, to) - from) / (to - from);

  // A dragon below its table's first level is an egg with no stats.
  const keys =
    pet.level.level < from
      ? []
      : Object.keys({ ...table?.first, ...table?.last });

  const own = keys.map((key) => {
    const stat = key as PlayerStat;
    const first = table?.first[stat] ?? 0;
    const last = table?.last[stat] ?? 0;
    const percent = (item?.allPetStats ?? 0) + (item?.petStats?.[stat] ?? 0);
    return {
      [stat]: (first + (last - first) * progress) * (1 + percent / 100),
    };
  });

  return sumStats([...own, item?.stats ?? {}]);
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

  const active = pets.find((pet) => pet.active);

  return {
    score: getPetScore(member),
    active,
    pets,
    totalXp: member.player_stats?.pets?.total_exp_gained ?? 0,
    skinned: pets.filter(({ skin }) => skin).length,
    candyUsed: add(...pets.map(({ candyUsed }) => candyUsed)),
    activeStats: getPetStats(active),
  };
}
