/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  ActionRowBuilder,
  ApiService,
  ButtonBuilder,
  Command,
  CommandContext,
  ErrorMessage,
  type IMessage,
  type LocalizationString,
  type LocalizeFunction,
  Message,
  type Page,
  PlayerArgument,
  SubCommand,
  paginate,
} from "@statsify/discord";
import { ButtonStyle } from "discord-api-types/v10";
import { Container } from "typedi";
import { FormattedGame, type User } from "@statsify/schemas";
import { ItemArgument } from "./item.argument.js";
import { type ItemIcons, loadItemIcons } from "./components/ItemSlot.js";
import { PRICE_ICON_SIZE, SkyBlockPriceProfile } from "./price.profile.js";
import { SkyBlockAccessoriesProfile, accessoryIcons } from "./accessories.profile.js";
import { SkyBlockChocolateProfile } from "./chocolate.profile.js";
import { SkyBlockCrimsonProfile, crimsonIcons } from "./crimson.profile.js";
import { SkyBlockDungeonsProfile, SkyBlockEssenceProfile } from "./dungeons.profile.js";
import { SkyBlockFishingProfile } from "./fishing.profile.js";
import { SkyBlockGardenProfile, gardenIcons } from "./garden.profile.js";
import { SkyBlockHotfProfile } from "./hotf.profile.js";
import { SkyBlockHotmProfile } from "./hotm.profile.js";
import { SkyBlockJacobProfile, jacobIcons } from "./jacob.profile.js";
import { SkyBlockLeaderboardArgument } from "#commands/leaderboards/skyblock-leaderboard.argument";
import { SkyBlockLeaderboardSubCommand } from "#commands/leaderboards/skyblock-leaderboard.subcommand";
import { SkyBlockLevelProfile, levelIcons } from "./level.profile.js";
import { SkyBlockNetworthProfile, networthIcons } from "./networth.profile.js";
import { SkyBlockPetsProfile, petIcons } from "./pets.profile.js";
import { SkyBlockSkillsProfile } from "./skills.profile.js";
import { SkyBlockSlayersProfile } from "./slayers.profile.js";
import { SkyBlockSummaryProfile } from "./summary.profile.js";
import { config } from "@statsify/util";
import { formatProfileName, hasMuseum } from "@statsify/skyblock/display";
import { getBackground, getLogo } from "@statsify/assets";
import { getItemIcon } from "@statsify/skyblock/icons";
import { getTheme } from "#themes";
import { render } from "@statsify/rendering";
import type {
  ApiSettings,
  GameMode,
  ItemTexture,
  MemberView,
  SkyBlockProfileView,
  SkyBlockSection,
} from "@statsify/skyblock";
import type { Image } from "skia-canvas";

const siteUrl = await config("skyblock.siteUrl", { required: false });

const GAME_MODE_EMOJI: Record<GameMode, string | false> = {
  normal: false,
  ironman: "♻️",
  stranded: "🏝️",
  bingo: "🎯",
};

export interface SkyBlockProfileProps {
  profile: SkyBlockProfileView;
  title: string;
  skin: Image;
  badge?: Image;
  background: Image;
  logo: Image;
  user: User | null;
  t: LocalizeFunction;
  icons: ItemIcons;
}

type SkyBlockProfile = (props: SkyBlockProfileProps) => JSX.Element;

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

type SkyBlockCardName = keyof typeof SKYBLOCK_CARDS;

// Not arrow functions: the command loader takes those for commands
export function skyBlockTitle(t: LocalizeFunction, profile: SkyBlockProfileView, name: SkyBlockCardName) {
  // The Header moves the profile onto its own line where that narrows the card
  return `§l${FormattedGame.SKYBLOCK} §f${t(`skyblock.titles.${name}`)}\n§r(${formatProfileName(profile)}§r)`;
}

export function getSkyBlockBackground() {
  // There are no SkyBlock backgrounds yet, and getBackground throws for a game without any
  return getBackground("hypixel", "overall");
}

// By uuid, which the site sends on to the name, since a name like "item" is one of the site's own paths
function fullProfile(uuid: string, cuteName: string) {
  if (!siteUrl) return;
  const url = `${siteUrl}/skyblock/${uuid}/${encodeURIComponent(cuteName.toLowerCase())}`;
  return [new ActionRowBuilder([new ButtonBuilder().label((t) => t("skyblock.fullProfile")).style(ButtonStyle.Link).url(url)])];
}

// A new profile reads every API setting as off and has no museum yet
function notes(t: LocalizeFunction, view: SkyBlockProfileView, card: SkyBlockCard) {
  const off = view.newProfile ? [] : card.settings.filter((setting) => view.member.apiSettings[setting] === false);
  const apiOff = off.filter((setting) => setting !== "banking");

  return [
    view.stale ? t("skyblock.stale", { time: Math.floor(view.fetchedAt / 1000) }) : "",
    apiOff.length > 0 ?
      t("skyblock.apiOffNote", { settings: apiOff.map((setting) => t(`skyblock.apiSettings.${setting}`)).join(", ") }) :
      "",
    off.includes("banking") ? t("skyblock.bankingOffNote") : "",
    !view.newProfile && hasMuseum(view.gameMode) && view.member.networth?.museumIncluded === false ?
      t("skyblock.museumNotCounted") :
      "",
    view.marketDown ? t("skyblock.pricesNotReady") : "",
  ]
    .filter(Boolean)
    .join("\n");
}

@Command({ description: (t) => t("commands.skyblock"), cooldown: 10 })
export class SkyBlockCommand {
  public constructor(private readonly apiService: ApiService) {}

  @SubCommand({ description: (t) => t("commands.skyblock-profile"), args: [PlayerArgument] })
  public profile(context: CommandContext) {
    return this.run(context, "profile");
  }

  @SubCommand({ description: (t) => t("commands.skyblock-networth"), args: [PlayerArgument] })
  public networth(context: CommandContext) {
    return this.run(context, "networth");
  }

  @SubCommand({ description: (t) => t("commands.skyblock-skills"), args: [PlayerArgument] })
  public skills(context: CommandContext) {
    return this.run(context, "skills");
  }

  @SubCommand({ description: (t) => t("commands.skyblock-pets"), args: [PlayerArgument] })
  public pets(context: CommandContext) {
    return this.run(context, "pets");
  }

  @SubCommand({ description: (t) => t("commands.skyblock-hotm"), args: [PlayerArgument] })
  public hotm(context: CommandContext) {
    return this.run(context, "hotm");
  }

  @SubCommand({ description: (t) => t("commands.skyblock-slayers"), args: [PlayerArgument] })
  public slayers(context: CommandContext) {
    return this.run(context, "slayers");
  }

  @SubCommand({ description: (t) => t("commands.skyblock-dungeons"), args: [PlayerArgument] })
  public dungeons(context: CommandContext) {
    return this.run(context, "dungeons");
  }

  @SubCommand({ description: (t) => t("commands.skyblock-accessories"), args: [PlayerArgument] })
  public accessories(context: CommandContext) {
    return this.run(context, "accessories");
  }

  @SubCommand({ description: (t) => t("commands.skyblock-level"), args: [PlayerArgument] })
  public level(context: CommandContext) {
    return this.run(context, "level");
  }

  @SubCommand({ description: (t) => t("commands.skyblock-crimson"), args: [PlayerArgument] })
  public crimson(context: CommandContext) {
    return this.run(context, "crimson");
  }

  @SubCommand({ description: (t) => t("commands.skyblock-fishing"), args: [PlayerArgument] })
  public fishing(context: CommandContext) {
    return this.run(context, "fishing");
  }

  @SubCommand({ description: (t) => t("commands.skyblock-jacob"), args: [PlayerArgument] })
  public jacob(context: CommandContext) {
    return this.run(context, "jacob");
  }

  @SubCommand({ description: (t) => t("commands.skyblock-garden"), args: [PlayerArgument] })
  public garden(context: CommandContext) {
    return this.run(context, "garden");
  }

  @SubCommand({ description: (t) => t("commands.skyblock-chocolate"), args: [PlayerArgument] })
  public chocolate(context: CommandContext) {
    return this.run(context, "chocolate");
  }

  @SubCommand({ description: (t) => t("commands.skyblock-hotf"), args: [PlayerArgument] })
  public hotf(context: CommandContext) {
    return this.run(context, "hotf");
  }

  @SubCommand({ description: (t) => t("commands.skyblock-leaderboard"), args: [SkyBlockLeaderboardArgument] })
  public leaderboard(context: CommandContext) {
    return Container.get(SkyBlockLeaderboardSubCommand).leaderboard(context);
  }

  @SubCommand({ description: (t) => t("commands.skyblock-price"), args: [new ItemArgument()] })
  public async price(context: CommandContext): Promise<IMessage> {
    const user = context.getUser();
    const price = await this.apiService.getSkyBlockPrice(context.option("item"));

    const [icon, logo, background] = await Promise.all([
      price.texture && getItemIcon(price.texture, { size: PRICE_ICON_SIZE }),
      getLogo(user),
      getSkyBlockBackground(),
    ]);

    const canvas = render(
      <SkyBlockPriceProfile price={price} icon={icon} background={background} logo={logo} user={user} t={context.t()} />,
      getTheme(user)
    );

    return {
      files: [{ name: "price.png", data: await canvas.toBuffer("png"), type: "image/png" }],
    };
  }

  private async run(context: CommandContext, name: SkyBlockCardName) {
    const card: SkyBlockCard = SKYBLOCK_CARDS[name];
    const user = context.getUser();
    const player = await this.apiService.getSkyBlockProfiles(context.option("player"), user);

    const summaries = player.profiles.toSorted((a, b) => Number(b.selected) - Number(a.selected));
    if (summaries.length === 0) throw new ErrorMessage("errors.skyblockNoProfiles");

    const views = new Map<string, Promise<SkyBlockProfileView>>();
    const getView = (id: string) => {
      if (!views.has(id)) {
        const view = this.apiService.getSkyBlockProfile(player.uuid, card.sections, user, id);
        view.catch(() => views.delete(id));
        views.set(id, view);
      }

      return views.get(id)!;
    };

    const [logo, skin, badge, background] = await Promise.all([
      getLogo(user),
      this.apiService.getPlayerSkin(player.uuid, user),
      this.apiService.getUserBadge(player.uuid),
      getSkyBlockBackground(),
      getView(summaries[0].id),
    ]);

    const generator = (id: string, Profile: SkyBlockProfile, iconsOf = card.icons) => async (t: LocalizeFunction) => {
      const view = await getView(id);
      const icons = await loadItemIcons(iconsOf?.(view.member) ?? []);
      const title = skyBlockTitle(t, view, name);

      const canvas = render(
        <Profile
          profile={view}
          title={title}
          skin={skin}
          badge={badge}
          background={background}
          logo={logo}
          user={user}
          t={t}
          icons={icons}
        />,
        getTheme(user)
      );

      return new Message({
        content: notes(t, view, card),
        files: [{ name: "skyblock.png", data: await canvas.toBuffer("png"), type: "image/png" }],
        attachments: [],
        embeds: [],
      });
    };

    const pages: Page[] = summaries.map(({ id, cuteName, gameMode }) => {
      const page = { label: cuteName, emoji: GAME_MODE_EMOJI[gameMode], rows: fullProfile(player.uuid, cuteName) };

      if (Array.isArray(card.profile)) {
        const subPages = card.profile.map(({ label, profile, icons }) => ({ label, generator: generator(id, profile, icons) }));
        return { ...page, subPages };
      }

      return { ...page, generator: generator(id, card.profile) };
    });

    return paginate(context, pages, { menu: true });
  }
}
