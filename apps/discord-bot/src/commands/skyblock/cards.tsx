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
  accessoryIcons,
} from "./accessories.profile.js";
import { SkyBlockDungeonsProfile } from "./dungeons.profile.js";
import { SkyBlockHotmProfile } from "./hotm.profile.js";
import { SkyBlockLevelProfile, levelIcons } from "./level.profile.js";
import { SkyBlockNetworthProfile, networthIcons } from "./networth.profile.js";
import { SkyBlockPetsProfile, petIcons } from "./pets.profile.js";
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
  /** Never the museum: its response also leaves out a member who donated nothing, so networth notes it instead. */
  settings: Exclude<keyof ApiSettings, "museum">[];
  icons?: (member: MemberView) => ItemTexture[];
  profile:
    | SkyBlockProfile
    | { label: LocalizationString; profile: SkyBlockProfile }[];
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
    ],
  },
  accessories: {
    sections: ["accessories"],
    settings: ["inventory"],
    icons: accessoryIcons,
    profile: SkyBlockAccessoriesProfile,
  },
  level: {
    sections: ["level"],
    settings: ["inventory"],
    icons: levelIcons,
    profile: SkyBlockLevelProfile,
  },
} satisfies Record<string, SkyBlockCard>;

export type SkyBlockCardName = keyof typeof SKYBLOCK_CARDS;

export function skyBlockTitle(
  t: LocalizeFunction,
  profile: SkyBlockProfileView,
  name: SkyBlockCardName,
) {
  return `§l${FormattedGame.SKYBLOCK} §f${t(`skyblock.titles.${name}`)} §r(${FORMATTED_PROFILES[profile.cuteName] ?? profile.cuteName}${GAME_MODES[profile.gameMode].badge}§r)`;
}

export function getSkyBlockBackground() {
  // There are no SkyBlock backgrounds yet, and getBackground throws for a game without any
  return getBackground("hypixel", "overall");
}
