/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  PET_RARITIES,
  getPetMaxLevel,
  getPetScore,
  getPetScorePoints,
  toSkyBlockLevel,
} from "#leveling";
import { PET_TEXTURES, SKYBLOCK_XP, getPetName } from "#data";
import { getAccessorySteps, keepBestPerChain } from "./accessories.js";
import { getItemCost, getPetKeyName, parsePetKey } from "#prices";
import { getPetTexture } from "#textures";
import { prettify } from "@statsify/util";
import type { ItemsResource, PriceMap, SkyBlockLevelSection } from "#types";
import type { RawMember } from "#raw";

type Source = SkyBlockLevelSection["sources"][number];

// Outside the bag first, since it costs nothing, and unpriced sources last.
const compareSources = (a: Source, b: Source) =>
  Number(b.outsideBag) - Number(a.outsideBag) ||
  (a.coinsPerXp ?? Infinity) - (b.coinsPerXp ?? Infinity) ||
  b.xp - a.xp ||
  a.name.localeCompare(b.name);

const getGainOverHighest = (
  current: number,
  highest: number | undefined,
  added: number,
) => Math.max(0, current + added - Math.max(current, highest ?? 0));

function getAccessorySources(
  member: RawMember,
  items: ItemsResource,
  prices: PriceMap,
  market: boolean,
) {
  const accessories = getAccessorySteps(member, items, prices, market);
  if (!accessories) return [];

  const { accessoryPower, highestAccessoryPower, steps } = accessories;
  const candidates = steps.map((step) => {
    const gain = getGainOverHighest(
      accessoryPower,
      highestAccessoryPower,
      step.accessoryPower,
    );
    const xp = gain * SKYBLOCK_XP.accessory_bag_xp;
    const source: Source = {
      kind: "accessory",
      id: step.id,
      name: step.name,
      xp,
      outsideBag: step.outsideBag,
      cost: step.cost,
      coinsPerXp: step.cost && step.cost.coins / xp,
      texture: step.texture,
    };
    return source;
  });

  const ranked = candidates.filter(({ xp }) => xp > 0).toSorted(compareSources);

  // An unpriced step still wins its chain, so the steps under it stay hidden.
  return keepBestPerChain(ranked).filter(
    ({ outsideBag, cost }) => !market || outsideBag || cost,
  );
}

function getPetSources(member: RawMember, prices: PriceMap, market: boolean) {
  const score = getPetScore(member);
  const getPetXp = (points: number) =>
    getGainOverHighest(score, member.leveling?.highest_pet_score, points) *
    SKYBLOCK_XP.pet_score_xp;

  const owned = new Set((member.pets_data?.pets ?? []).map(({ type }) => type));
  const best = new Map<string, Source>();

  if (!market) {
    for (const [type, heads] of Object.entries(PET_TEXTURES.pets)) {
      const tier = PET_RARITIES.findLast((scored) => heads[scored]);
      if (!tier || owned.has(type)) continue;

      const xp = getPetXp(getPetScorePoints(tier));
      if (xp === 0) continue;

      best.set(type, {
        kind: "pet",
        id: type,
        name: `${prettify(tier)} ${getPetName(type)}`,
        xp,
        outsideBag: false,
        texture: getPetTexture(type, tier),
      });
    }

    return [...best.values()];
  }

  for (const [key, entry] of Object.entries(prices.entries)) {
    const pet = parsePetKey(key);
    const cost = getItemCost(entry);
    if (!pet || !cost || owned.has(pet.type)) continue;

    // A max-level pet adds a point to the pet score.
    const maxed = pet.level === getPetMaxLevel(pet.type);
    const xp = getPetXp(getPetScorePoints(pet.rarity) + Number(maxed));
    if (xp === 0) continue;

    const source: Source = {
      kind: "pet",
      id: key,
      name: getPetKeyName(pet),
      xp,
      outsideBag: false,
      cost,
      coinsPerXp: cost.coins / xp,
      texture: getPetTexture(pet.type, pet.rarity),
    };

    const kept = best.get(pet.type);
    if (!kept || compareSources(source, kept) < 0) best.set(pet.type, source);
  }

  return [...best.values()];
}

// Without a market, pets show at their highest scored tier with no cost.
export function getSkyBlockLevel(
  member: RawMember,
  items: ItemsResource,
  prices: PriceMap,
  market: boolean,
): SkyBlockLevelSection {
  const sources = [
    ...getAccessorySources(member, items, prices, market),
    ...getPetSources(member, prices, market),
  ];

  return {
    level: toSkyBlockLevel(member.leveling?.experience ?? 0),
    pricesAsOf: prices.asOf,
    market,
    sources: sources.toSorted(compareSources),
  };
}
