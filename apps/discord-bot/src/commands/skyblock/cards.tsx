/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FormattedGame } from "@statsify/schemas";
import {
  SkyBlockAccessoriesProfile,
  getAccessoryIcons,
} from "./accessories.profile.js";
import {
  STAT_PAGES,
  SkyBlockAttributesProfile,
  SkyBlockStatsProfile,
} from "./stats.profile.js";
import {
  SkyBlockBestiaryProfile,
  SkyBlockCollectionsProfile,
  SkyBlockMinionsProfile,
  getCollectionIcons,
  getMinionIcons,
} from "./collections.profile.js";
import { SkyBlockChocolateProfile } from "./chocolate.profile.js";
import { SkyBlockCrimsonProfile, getCrimsonIcons } from "./crimson.profile.js";
import {
  SkyBlockDungeonsProfile,
  SkyBlockEssenceProfile,
} from "./dungeons.profile.js";
import {
  SkyBlockExperimentsProfile,
  SkyBlockMiscProfile,
  SkyBlockRiftProfile,
  getConsumableIcons,
} from "./misc.profile.js";
import { SkyBlockFishingProfile } from "./fishing.profile.js";
import {
  SkyBlockGearProfile,
  SkyBlockMuseumProfile,
  getGearIcons,
} from "./gear.profile.js";
import { SkyBlockGardenProfile, getGardenIcons } from "./garden.profile.js";
import { SkyBlockHotfProfile } from "./hotf.profile.js";
import { SkyBlockHotmProfile } from "./hotm.profile.js";
import { SkyBlockJacobProfile, getJacobIcons } from "./jacob.profile.js";
import { SkyBlockLevelProfile, getLevelIcons } from "./level.profile.js";
import {
  SkyBlockNetworthProfile,
  getNetworthIcons,
} from "./networth.profile.js";
import { SkyBlockPetsProfile, getPetIcons } from "./pets.profile.js";
import { SkyBlockValuesProfile, getMissingPetIcons } from "./values.profile.js";
import { SkyBlockSkillsProfile } from "./skills.profile.js";
import { SkyBlockSlayersProfile } from "./slayers.profile.js";
import { SkyBlockSummaryProfile } from "./summary.profile.js";
import { prettify } from "@statsify/util";
import {
  COLLECTION_CATEGORIES,
  formatProfileName,
} from "@statsify/skyblock/display";
import { getBackground } from "@statsify/assets";
import type {
  ApiSettings,
  ItemTexture,
  MemberView,
  SkyBlockProfileView,
  SkyBlockSection,
} from "@statsify/skyblock";
import type { LocalizationString, LocalizeFunction } from "@statsify/discord";
import type { SkyBlockProfileProps } from "./skyblock.command.js";

export type SkyBlockProfile = (props: SkyBlockProfileProps) => JSX.Element;

export interface SkyBlockCard {
  sections: SkyBlockSection[];
  // Never museum, since its response leaves out members who donated nothing.
  settings: Exclude<keyof ApiSettings, "museum">[];
  icons?: (member: MemberView) => ItemTexture[];
  profile: SkyBlockProfile | SkyBlockSubPage[];
}

interface SkyBlockSubPage {
  label: LocalizationString;
  profile: SkyBlockProfile;
  icons?: SkyBlockCard["icons"];
}

export const SKYBLOCK_CARDS = {
  profile: {
    sections: ["skills", "dungeons", "slayers", "accessories", "networth"],
    settings: ["skills", "inventory", "personalVault", "banking"],
    profile: SkyBlockSummaryProfile,
  },
  networth: {
    sections: ["networth"],
    settings: ["inventory", "personalVault", "banking"],
    icons: getNetworthIcons,
    profile: SkyBlockNetworthProfile,
  },
  skills: {
    sections: ["skills"],
    settings: ["skills"],
    profile: SkyBlockSkillsProfile,
  },
  pets: {
    sections: ["pets"],
    settings: [],
    icons: getPetIcons,
    profile: SkyBlockPetsProfile,
  },
  hotm: {
    sections: ["hotm"],
    settings: [],
    profile: SkyBlockHotmProfile,
  },
  slayers: {
    sections: ["slayers"],
    settings: [],
    profile: SkyBlockSlayersProfile,
  },
  dungeons: {
    sections: ["dungeons"],
    settings: [],
    profile: [
      {
        label: (t) => t("skyblock.catacombs"),
        profile: (props) => (
          <SkyBlockDungeonsProfile {...props} mode="normal" />
        ),
      },
      {
        label: (t) => t("skyblock.masterMode"),
        profile: (props) => (
          <SkyBlockDungeonsProfile {...props} mode="master" />
        ),
      },
      { label: (t) => t("skyblock.essence"), profile: SkyBlockEssenceProfile },
    ],
  },
  accessories: {
    sections: ["accessories"],
    settings: ["inventory"],
    profile: [
      {
        label: (t) => t("skyblock.accessories"),
        profile: (props) => (
          <SkyBlockAccessoriesProfile {...props} page="missing" />
        ),
        icons: getAccessoryIcons("missing"),
      },
      {
        label: (t) => t("skyblock.inactive"),
        profile: (props) => (
          <SkyBlockAccessoriesProfile {...props} page="inactive" />
        ),
        icons: getAccessoryIcons("inactive"),
      },
    ],
  },
  level: {
    sections: ["level"],
    settings: ["inventory"],
    icons: getLevelIcons,
    profile: SkyBlockLevelProfile,
  },
  crimson: {
    sections: ["crimson"],
    settings: [],
    icons: getCrimsonIcons,
    profile: SkyBlockCrimsonProfile,
  },
  fishing: {
    sections: ["fishing"],
    settings: [],
    profile: [
      {
        label: (t) => t("skyblock.trophyFish"),
        profile: (props) => (
          <SkyBlockFishingProfile {...props} page="trophyFish" />
        ),
      },
      {
        label: (t) => t("skyblock.seaCreatures"),
        profile: (props) => (
          <SkyBlockFishingProfile {...props} page="seaCreatures" />
        ),
      },
    ],
  },
  jacob: {
    sections: ["jacob"],
    settings: [],
    icons: getJacobIcons,
    profile: SkyBlockJacobProfile,
  },
  garden: {
    sections: ["garden"],
    settings: [],
    icons: getGardenIcons,
    profile: SkyBlockGardenProfile,
  },
  chocolate: {
    sections: ["chocolate"],
    settings: [],
    profile: SkyBlockChocolateProfile,
  },
  hotf: {
    sections: ["hotf"],
    settings: [],
    profile: SkyBlockHotfProfile,
  },
  collections: {
    sections: ["collections"],
    settings: ["collections"],
    profile: COLLECTION_CATEGORIES.map((category) => ({
      label: () => prettify(category),
      profile: (props: SkyBlockProfileProps) => (
        <SkyBlockCollectionsProfile {...props} category={category} />
      ),
      icons: getCollectionIcons(category),
    })),
  },
  minions: {
    sections: ["minions"],
    settings: [],
    icons: getMinionIcons,
    profile: SkyBlockMinionsProfile,
  },
  bestiary: {
    sections: ["bestiary"],
    settings: [],
    profile: SkyBlockBestiaryProfile,
  },
  stats: {
    sections: ["stats"],
    settings: ["skills", "inventory"],
    profile: (Object.keys(STAT_PAGES) as (keyof typeof STAT_PAGES)[]).map(
      (page): SkyBlockSubPage => ({
        label: (t) => t(`skyblock.statPages.${page}`),
        profile: (props) => <SkyBlockStatsProfile {...props} page={page} />,
      }),
    ),
  },
  attributes: {
    sections: ["attributes"],
    settings: [],
    profile: SkyBlockAttributesProfile,
  },
  gear: {
    sections: ["gear"],
    settings: ["inventory"],
    icons: getGearIcons,
    profile: SkyBlockGearProfile,
  },
  museum: {
    sections: ["museum"],
    settings: [],
    profile: SkyBlockMuseumProfile,
  },
  rift: {
    sections: ["rift"],
    settings: [],
    profile: SkyBlockRiftProfile,
  },
  experiments: {
    sections: ["experiments"],
    settings: [],
    profile: SkyBlockExperimentsProfile,
  },
  misc: {
    sections: ["misc"],
    settings: [],
    icons: getConsumableIcons,
    profile: SkyBlockMiscProfile,
  },
  values: {
    sections: ["values"],
    settings: ["inventory"],
    icons: getMissingPetIcons,
    profile: SkyBlockValuesProfile,
  },
} satisfies Record<string, SkyBlockCard>;

export type SkyBlockCardName = keyof typeof SKYBLOCK_CARDS;

export const getSkyBlockHeading = (
  t: LocalizeFunction,
  name: SkyBlockCardName | "bingo" | "calendar" | "ranks",
) => `§l${FormattedGame.SKYBLOCK} §f${t(`skyblock.titles.${name}`)}`;

export function getSkyBlockTitle(
  t: LocalizeFunction,
  profile: SkyBlockProfileView,
  name: SkyBlockCardName,
) {
  // The Header puts the profile on its own line only where that's narrower.
  return `${getSkyBlockHeading(t, name)}\n§r(${formatProfileName(profile)}§r)`;
}

export function getSkyBlockBackground() {
  // getBackground throws for SkyBlock, which has no backgrounds yet.
  return getBackground("hypixel", "overall");
}
