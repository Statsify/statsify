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
  SkyBlockDungeonsProfile,
  SkyBlockEssenceProfile,
} from "./dungeons.profile.js";
import { SkyBlockHotmProfile } from "./hotm.profile.js";
import { SkyBlockLevelProfile, getLevelIcons } from "./level.profile.js";
import {
  SkyBlockNetworthProfile,
  getNetworthIcons,
} from "./networth.profile.js";
import { SkyBlockPetsProfile, getPetIcons } from "./pets.profile.js";
import { SkyBlockSkillsProfile } from "./skills.profile.js";
import { SkyBlockSlayersProfile } from "./slayers.profile.js";
import { SkyBlockSummaryProfile } from "./summary.profile.js";
import { getBackground } from "@statsify/assets";
import type {
  ApiSettings,
  GameMode,
  ItemTexture,
  MemberView,
  SkyBlockProfileView,
  SkyBlockSection,
} from "@statsify/skyblock";
import type { LocalizationString, LocalizeFunction } from "@statsify/discord";
import type { SkyBlockProfileProps } from "./skyblock.command.js";

export const GAME_MODES: Record<
  GameMode,
  { emoji: string | false; badge: string }
> = {
  normal: { emoji: false, badge: "" },
  ironman: { emoji: "♻️", badge: " §7♲" },
  stranded: { emoji: "🏝️", badge: " §a☀" },
  bingo: { emoji: "🎯", badge: " §6Ⓑ" },
};

const FORMATTED_PROFILES: Record<string, string | undefined> = {
  Apple: "§cApple",
  Banana: "§eBanana",
  Blueberry: "§9Blueberry",
  Coconut: "§6Coco§fnut",
  Cucumber: "§2Cucumber",
  Grapes: "§5Grapes",
  Kiwi: "§aKiwi",
  Lemon: "§eLemon",
  Lime: "§aLime",
  Mango: "§6Mango",
  Orange: "§6Orange",
  Papaya: "§6Papaya",
  Peach: "§dPeach",
  Pear: "§aPear",
  Pineapple: "§ePineapple",
  Pomegranate: "§4Pomegranate",
  Raspberry: "§dRaspberry",
  Strawberry: "§cStrawberry",
  Tomato: "§cTomato",
  Watermelon: "§aWater§cmelon",
  Zucchini: "§2Zucchini",
};

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
} satisfies Record<string, SkyBlockCard>;

export type SkyBlockCardName = keyof typeof SKYBLOCK_CARDS;

export function getSkyBlockTitle(
  t: LocalizeFunction,
  profile: SkyBlockProfileView,
  name: SkyBlockCardName,
) {
  const cuteName = FORMATTED_PROFILES[profile.cuteName] ?? profile.cuteName;
  const { badge } = GAME_MODES[profile.gameMode];
  return `§l${FormattedGame.SKYBLOCK} §f${t(`skyblock.titles.${name}`)} §r(${cuteName}${badge}§r)`;
}

export function getSkyBlockBackground() {
  // getBackground throws for SkyBlock, which has no backgrounds yet.
  return getBackground("hypixel", "overall");
}
