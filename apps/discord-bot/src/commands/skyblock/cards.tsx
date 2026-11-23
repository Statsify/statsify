/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FormattedGame } from "@statsify/schemas";
import { SkyBlockAccessoriesProfile, accessoryIcons } from "./accessories.profile.js";
import { SkyBlockChocolateProfile } from "./chocolate.profile.js";
import { SkyBlockCrimsonProfile, crimsonIcons } from "./crimson.profile.js";
import { SkyBlockDungeonsProfile, SkyBlockEssenceProfile } from "./dungeons.profile.js";
import { SkyBlockFishingProfile } from "./fishing.profile.js";
import { SkyBlockGardenProfile, gardenIcons } from "./garden.profile.js";
import { SkyBlockHotfProfile } from "./hotf.profile.js";
import { SkyBlockHotmProfile } from "./hotm.profile.js";
import { SkyBlockJacobProfile, jacobIcons } from "./jacob.profile.js";
import { SkyBlockLevelProfile, levelIcons } from "./level.profile.js";
import { SkyBlockNetworthProfile, networthIcons } from "./networth.profile.js";
import { SkyBlockPetsProfile, petIcons } from "./pets.profile.js";
import { SkyBlockSkillsProfile } from "./skills.profile.js";
import { SkyBlockSlayersProfile } from "./slayers.profile.js";
import { SkyBlockSummaryProfile } from "./summary.profile.js";
import { formatProfileName } from "@statsify/skyblock/display";
import { getBackground } from "@statsify/assets";
import type { ApiSettings, ItemTexture, MemberView, SkyBlockProfileView, SkyBlockSection } from "@statsify/skyblock";
import type { LocalizationString, LocalizeFunction } from "@statsify/discord";
import type { SkyBlockProfileProps } from "./skyblock.command.js";

export type SkyBlockProfile = (props: SkyBlockProfileProps) => JSX.Element;

export interface SkyBlockCard {
  sections: SkyBlockSection[];
  /** Never the museum: its response also leaves out a member who donated nothing, so networth notes it instead. */
  settings: Exclude<keyof ApiSettings, "museum">[];
  icons?: (member: MemberView) => ItemTexture[];
  profile: SkyBlockProfile | SkyBlockSubPage[];
}

interface SkyBlockSubPage {
  label: LocalizationString;
  profile: SkyBlockProfile;
  icons?: SkyBlockCard["icons"]; // in place of the card's
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
    icons: networthIcons,
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
    icons: petIcons,
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
      { label: (t) => t("skyblock.catacombs"), profile: (props) => <SkyBlockDungeonsProfile {...props} mode="normal" /> },
      { label: (t) => t("skyblock.masterMode"), profile: (props) => <SkyBlockDungeonsProfile {...props} mode="master" /> },
      { label: (t) => t("skyblock.essence"), profile: SkyBlockEssenceProfile },
    ],
  },
  accessories: {
    sections: ["accessories"],
    settings: ["inventory"],
    profile: [
      {
        label: (t) => t("skyblock.accessories"),
        profile: (props) => <SkyBlockAccessoriesProfile {...props} page="missing" />,
        icons: accessoryIcons("missing"),
      },
      {
        label: (t) => t("skyblock.inactive"),
        profile: (props) => <SkyBlockAccessoriesProfile {...props} page="inactive" />,
        icons: accessoryIcons("inactive"),
      },
    ],
  },
  level: {
    sections: ["level"],
    settings: ["inventory"],
    icons: levelIcons,
    profile: SkyBlockLevelProfile,
  },
  crimson: {
    sections: ["crimson"],
    settings: [],
    icons: crimsonIcons,
    profile: SkyBlockCrimsonProfile,
  },
  fishing: {
    sections: ["fishing"],
    settings: [],
    profile: [
      { label: (t) => t("skyblock.trophyFish"), profile: (props) => <SkyBlockFishingProfile {...props} page="trophyFish" /> },
      { label: (t) => t("skyblock.seaCreatures"), profile: (props) => <SkyBlockFishingProfile {...props} page="seaCreatures" /> },
    ],
  },
  jacob: {
    sections: ["jacob"],
    settings: [],
    icons: jacobIcons,
    profile: SkyBlockJacobProfile,
  },
  garden: {
    sections: ["garden"],
    settings: [],
    icons: gardenIcons,
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
} satisfies Record<string, SkyBlockCard>;

export type SkyBlockCardName = keyof typeof SKYBLOCK_CARDS;

export function skyBlockTitle(t: LocalizeFunction, profile: SkyBlockProfileView, name: SkyBlockCardName) {
  // The Header moves the profile onto its own line where that narrows the card
  return `§l${FormattedGame.SKYBLOCK} §f${t(`skyblock.titles.${name}`)}\n§r(${formatProfileName(profile)}§r)`;
}

export function getSkyBlockBackground() {
  // There are no SkyBlock backgrounds yet, and getBackground throws for a game without any
  return getBackground("hypixel", "overall");
}
