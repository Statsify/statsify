/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { GARDEN } from "#data";
import {
  type GardenSection,
  type GardenView,
  type ItemsResource,
  RARITIES,
  type Rarity,
} from "#types";
import { getLevel } from "#leveling";
import { prettify } from "@statsify/util";
import { resourceItem } from "#textures";
import type { RawGarden, RawMember } from "#raw";

// The composter menu's order, since the synced table's keys are sorted.
const COMPOSTER_UPGRADES = [
  "speed",
  "multi_drop",
  "fuel_cap",
  "organic_matter_cap",
  "cost_reduction",
] as const;

// The wiki's visitor list names the visitors whose id isn't their name.
const VISITOR_NAMES: Record<string, string> = {
  adventurer: "Combat Merchant",
  artist: "Marco",
  bear_pete: "Pete",
  dante_goon: "Ghost of Goon",
  disguised_rats: "Pest Wrangler?",
  dragon_ritualist: "Tyzzo",
  dulin_tunnels: "Dulin",
  end_dealer: "Pearl Dealer",
  fire_guy: "Ryan",
  fisherman: "Fisherman Gerald",
  ghost_of_armorsmith: "Ghost of Armorsmith",
  ghost_of_baking_specialist: "Ghost of Baking Specialist",
  ghost_of_game_agent: "Ghost of Game Agent",
  ghost_of_warren: "Ghost of Warren",
  lumberjack: "Lumber Jack",
  madame_eleanor: "Madame Eleanor Q. Goldsworth III",
  mage_alchemist: "Alchemage",
  master_tactician: "Master Tactician Funk",
  pet_trainer: "Fann",
  royal_resident_neighbour: "Resident Neighbor",
  royal_resident_peasant: "Resident Snooty",
  royal_resident_reward: "Royal Resident",
  scardius: "Scout Scardius",
  seraphine: "Clerk Seraphine",
  snowmaker: "Gary",
  st_jerry: "St. Jerry",
  tia: "Tia the Fairy",
  tyashoi: "Tyashoi Alchemist",
  vargul_garden: "Vargul",
  wolf_shaman: "Old Shaman Nyko",
};

// The wiki's skin pages give the kind and name of the skins with no item.
const ITEMLESS_GREENHOUSE_SKINS = new Set(["dante", "shipwreck"]);
const ITEMLESS_SKIN_NAMES: Record<string, string> = {
  dante: "Dante's Uprising",
  end: "The End",
};

const byName = <T extends { name: string }>(a: T, b: T) =>
  a.name.localeCompare(b.name);

const getRarityIndex = (rarity?: Rarity) =>
  rarity ? RARITIES.indexOf(rarity) : -1;

// spring_barn's item is "Spring Barn Skin", so its name keeps the kind.
const getSkinItemName = (
  items: ItemsResource,
  id: string,
  kind: "Barn" | "Greenhouse",
) => {
  const suffix = id.endsWith(`_${kind.toLowerCase()}`)
    ? " Skin"
    : ` ${kind} Skin`;
  return items.items[
    `${id.toUpperCase()}_${kind.toUpperCase()}_SKIN`
  ]?.name.replace(suffix, "");
};

// Hypixel lists the greenhouse skins among the barn skins.
const isGreenhouseSkin = (items: ItemsResource, id: string) =>
  ITEMLESS_GREENHOUSE_SKINS.has(id) ||
  getSkinItemName(items, id, "Greenhouse") !== undefined;

const getSkinName = (
  items: ItemsResource,
  id: string,
  kind: "Barn" | "Greenhouse",
) =>
  getSkinItemName(items, id, kind) ?? ITEMLESS_SKIN_NAMES[id] ?? prettify(id);

export function getGarden(
  member: RawMember,
  garden: RawGarden | null | undefined,
  items: ItemsResource,
): GardenSection {
  const player = member.garden_player_data;
  const analyzed = new Set(player?.analyzed_greenhouse_crops);

  // The list also holds plants that aren't mutations, like a Dead Plant.
  const mutations = (player?.discovered_greenhouse_crops ?? []).filter(
    (id) => items.items[id.toUpperCase()]?.category === "MUTATION",
  );

  return {
    copper: player?.copper ?? 0,
    greenhouse: mutations
      .map((id) => ({
        id,
        name: items.items[id.toUpperCase()].name,
        analyzed: analyzed.has(id),
      }))
      .toSorted(byName),
    garden: garden ? toGardenView(garden, items) : null,
  };
}

function toGardenView(garden: RawGarden, items: ItemsResource): GardenView {
  const commissions = garden.commission_data;
  const {
    selected_barn_skin: selected,
    unlocked_barn_skins: unlockedSkins = [],
  } = garden;

  return {
    level: getLevel(
      garden.garden_experience ?? 0,
      GARDEN.garden_exp,
      GARDEN.garden_exp.length,
    ),
    plots: {
      unlocked: garden.unlocked_plots_ids?.length ?? 0,
      total: GARDEN.plots.length,
    },
    crops: Object.entries(GARDEN.crop_milestones)
      .map(([id, tiers]) => {
        const collected = garden.resources_collected?.[id] ?? 0;
        return {
          id,
          ...resourceItem(items, id),
          collected,
          milestone: getLevel(collected, tiers, tiers.length),
          upgrade: {
            level: garden.crop_upgrade_levels?.[id] ?? 0,
            maxLevel: GARDEN.crop_upgrades,
          },
        };
      })
      .toSorted(byName),
    composter: COMPOSTER_UPGRADES.map((id) => ({
      id,
      name: id === "speed" ? "Composter Speed" : prettify(id),
      level: garden.composter_data?.upgrades?.[id] ?? 0,
      maxLevel: GARDEN.composter_upgrades[id],
    })),
    visitors: {
      unique: commissions?.unique_npcs_served ?? 0,
      served: commissions?.total_completed ?? 0,
      list: Object.entries(commissions?.visits ?? {})
        .map(([id, visits]) => ({
          id,
          name: VISITOR_NAMES[id] ?? prettify(id),
          rarity: GARDEN.visitors[id],
          visits,
          completed: commissions?.completed?.[id] ?? 0,
        }))
        .toSorted(
          (a, b) =>
            getRarityIndex(b.rarity) - getRarityIndex(a.rarity) || byName(a, b),
        ),
    },
    // Hypixel doesn't list a skin from a Garden level until it's selected.
    barnSkins: {
      selected: selected && getSkinName(items, selected, "Barn"),
      unlocked: unlockedSkins
        .filter((id) => !isGreenhouseSkin(items, id))
        .map((id) => getSkinName(items, id, "Barn")),
    },
    greenhouseSkins: unlockedSkins
      .filter((id) => isGreenhouseSkin(items, id))
      .map((id) => getSkinName(items, id, "Greenhouse")),
  };
}

if (import.meta.vitest) {
  const { suite, it, expect } = import.meta.vitest;

  const items: ItemsResource = { lastUpdated: 0, museum: {}, items: {} };
  const wheat = GARDEN.crop_milestones.WHEAT;

  const getView = (xp: number, collected: number) =>
    getGarden(
      {},
      { garden_experience: xp, resources_collected: { WHEAT: collected } },
      items,
    ).garden!;

  const getWheatMilestone = (collected: number) =>
    getView(0, collected).crops.find(({ id }) => id === "WHEAT")!.milestone;

  suite("getGarden", () => {
    it("should level the Garden from level 1", () => {
      expect(getView(0, 0).level).toMatchObject({
        level: 1,
        xpCurrent: 0,
        xpForNext: 70,
      });
      expect(getView(140, 0).level).toMatchObject({ level: 3, xpCurrent: 0 });
      expect(getView(1_000_000, 0).level).toMatchObject({
        level: 15,
        xpForNext: undefined,
        progress: 1,
      });
    });

    it("should level each crop's milestone", () => {
      expect(getWheatMilestone(0)).toMatchObject({
        level: 0,
        xpForNext: wheat[0],
      });
      expect(getWheatMilestone(wheat[0])).toMatchObject({
        level: 1,
        xpCurrent: 0,
        xpForNext: wheat[1],
      });
      expect(getWheatMilestone(Number.MAX_SAFE_INTEGER)).toMatchObject({
        level: 46,
        xpForNext: undefined,
      });
    });
  });
}
