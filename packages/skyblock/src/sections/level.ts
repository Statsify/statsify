/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { costOf, parsePetKey } from "#prices";
import { PET_RARITIES, getPets, petMaxLevel, petName, petScorePoints, petTexture } from "./pets.js";
import { PET_TEXTURES, SKYBLOCK_XP } from "#data";
import { SKYBLOCK_XP_PER_LEVEL } from "../profiles.js";
import { cheapestFirst, getAccessories } from "./accessories.js";
import { prettify } from "@statsify/util";
import type { ItemsResource, Level, MissingAccessory, PriceMap, SkyBlockLevelSection } from "#types";
import type { RawMember } from "#raw";

type Source = SkyBlockLevelSection["sources"][number];

/** SkyBlock levels have no cap, so maxLevel is the next one and the bar always runs to it. */
function toLevel(xp: number): Level {
  const level = Math.floor(xp / SKYBLOCK_XP_PER_LEVEL);
  const xpCurrent = xp % SKYBLOCK_XP_PER_LEVEL;
  return {
    level,
    maxLevel: level + 1,
    xp,
    xpCurrent,
    xpForNext: SKYBLOCK_XP_PER_LEVEL,
    progress: xpCurrent / SKYBLOCK_XP_PER_LEVEL,
  };
}

/** SkyBlock XP is never taken back, so a task pays only for what goes past the highest value it has reached. */
const gainOver = (current: number, highest: number | undefined, added: number) =>
  Math.max(0, current + added - Math.max(current, highest ?? 0));

const accessoryXp = (power: number, highest: number | undefined, added: number) =>
  gainOver(power, highest, added) * SKYBLOCK_XP.accessory_bag_xp;

const compareSources = cheapestFirst<Source>((source) => source.coinsPerXp, (source) => source.xp);

/**
 * Missing accessories and pet types the player has none of, each at its cheapest tier. Without a market, nothing has a
 * cost and pets are at their highest tier.
 */
export function getSkyBlockLevel(
  member: RawMember,
  items: ItemsResource,
  prices: PriceMap,
  market: boolean
): SkyBlockLevelSection {
  // Each chain keeps its cheapest step per XP: under the highest, the cheapest per accessory power can pay none, and a
  // step that pays none goes last even when it's free.
  const accessories = getAccessories(member, items, prices, market, (power, highest) => {
    const xp = (step: MissingAccessory) => accessoryXp(power, highest, step.accessoryPower);
    const cheapest = cheapestFirst<MissingAccessory>((step) => step.cost && step.cost.coins / xp(step), xp);
    return (a, b) => Number(xp(a) === 0) - Number(xp(b) === 0) || cheapest(a, b);
  });
  const { score, pets } = getPets(member);
  const owned = new Set(pets.map((pet) => pet.type));

  const petXp = (tier: string, maxed = false) =>
    gainOver(score, member.leveling?.highest_pet_score, petScorePoints(tier) + Number(maxed)) * SKYBLOCK_XP.pet_score_xp;

  const sources: Source[] = !accessories
    ? []
    : accessories.missing.flatMap(({ id, name, accessoryPower, outsideBag, cost, texture }) => {
        const xp = accessoryXp(accessories.accessoryPower, accessories.highestAccessoryPower, accessoryPower);
        if (xp === 0 || (market && !outsideBag && !cost)) return [];
        return [{ kind: "accessory", id, name, xp, outsideBag, cost, coinsPerXp: cost && cost.coins / xp, texture }];
      });

  const best = new Map<string, Source>();
  if (market) {
    for (const [key, entry] of Object.entries(prices.entries)) {
      const pet = parsePetKey(key);
      const cost = costOf(entry);
      if (!pet || !cost || owned.has(pet.type)) continue;

      const xp = petXp(pet.rarity, pet.level === petMaxLevel(pet.type));
      if (xp === 0) continue;

      const source: Source = {
        kind: "pet",
        id: key,
        name: pet.name,
        xp,
        outsideBag: false,
        cost,
        coinsPerXp: cost.coins / xp,
        texture: petTexture(pet.type, pet.rarity),
      };

      const kept = best.get(pet.type);
      if (!kept || compareSources(source, kept) < 0) best.set(pet.type, source);
    }
  } else {
    for (const [type, heads] of Object.entries(PET_TEXTURES.pets)) {
      const tier = PET_RARITIES.findLast((scored) => heads[scored]);
      if (!tier || owned.has(type)) continue;

      const xp = petXp(tier);
      if (xp === 0) continue;

      const name = `${prettify(tier)} ${petName(type)}`;
      best.set(type, { kind: "pet", id: type, name, xp, outsideBag: false, texture: petTexture(type, tier) });
    }
  }

  return {
    level: toLevel(member.leveling?.experience ?? 0),
    pricesAsOf: prices.asOf,
    market,
    sources: [...sources, ...best.values()].toSorted(compareSources),
  };
}
