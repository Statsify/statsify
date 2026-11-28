/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  ApiService,
  Command,
  CommandContext,
  ErrorMessage,
  type IMessage,
  type LocalizeFunction,
  Message,
  type Page,
  PlayerArgument,
  SubCommand,
  paginate,
} from "@statsify/discord";
import {
  SKYBLOCK_CARDS,
  type SkyBlockCard,
  type SkyBlockCardName,
  type SkyBlockProfile,
  getSkyBlockBackground,
  getSkyBlockTitle,
} from "./cards.js";
import { ItemArgument } from "./item.argument.js";
import { type ItemIcons, loadItemIcons } from "./components/ItemSlot.js";
import { PRICE_ICON_SIZE, SkyBlockPriceProfile } from "./price.profile.js";
import { hasMuseum } from "@statsify/skyblock/display";
import { getItemIcon } from "@statsify/skyblock/icons";
import { getLogo } from "@statsify/assets";
import { getTheme } from "#themes";
import { render } from "@statsify/rendering";
import type { Image } from "skia-canvas";
import type { GameMode, SkyBlockProfileView } from "@statsify/skyblock";
import type { User } from "@statsify/schemas";

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

function getSettingNotes(
  t: LocalizeFunction,
  view: SkyBlockProfileView,
  card: SkyBlockCard,
) {
  // A new profile reads every API setting as off and has no museum yet.
  if (view.newProfile) return [];

  const notes: string[] = [];
  const off = card.settings.filter(
    (setting) => view.member.apiSettings[setting] === false,
  );
  const apiOff = off.filter((setting) => setting !== "banking");

  if (apiOff.length > 0) {
    const settings = apiOff
      .map((setting) => t(`skyblock.apiSettings.${setting}`))
      .join(", ");
    notes.push(t("skyblock.apiOffNote", { settings }));
  }

  if (off.includes("banking")) notes.push(t("skyblock.bankingOffNote"));

  const museumMissed =
    hasMuseum(view.gameMode) && view.member.networth?.museumIncluded === false;
  if (museumMissed) notes.push(t("skyblock.museumNotCounted"));

  return notes;
}

function getNotes(
  t: LocalizeFunction,
  view: SkyBlockProfileView,
  card: SkyBlockCard,
) {
  const notes: string[] = [];

  if (view.stale) {
    const time = Math.floor(view.fetchedAt / 1000);
    notes.push(t("skyblock.stale", { time }));
  }

  notes.push(...getSettingNotes(t, view, card));
  if (view.marketDown) notes.push(t("skyblock.pricesNotReady"));

  return notes.join("\n");
}

@Command({ description: (t) => t("commands.skyblock"), cooldown: 10 })
export class SkyBlockCommand {
  public constructor(private readonly apiService: ApiService) {}

  @SubCommand({
    description: (t) => t("commands.skyblock-profile"),
    args: [PlayerArgument],
  })
  public profile(context: CommandContext) {
    return this.run(context, "profile");
  }

  @SubCommand({
    description: (t) => t("commands.skyblock-networth"),
    args: [PlayerArgument],
  })
  public networth(context: CommandContext) {
    return this.run(context, "networth");
  }

  @SubCommand({
    description: (t) => t("commands.skyblock-skills"),
    args: [PlayerArgument],
  })
  public skills(context: CommandContext) {
    return this.run(context, "skills");
  }

  @SubCommand({
    description: (t) => t("commands.skyblock-pets"),
    args: [PlayerArgument],
  })
  public pets(context: CommandContext) {
    return this.run(context, "pets");
  }

  @SubCommand({
    description: (t) => t("commands.skyblock-hotm"),
    args: [PlayerArgument],
  })
  public hotm(context: CommandContext) {
    return this.run(context, "hotm");
  }

  @SubCommand({
    description: (t) => t("commands.skyblock-slayers"),
    args: [PlayerArgument],
  })
  public slayers(context: CommandContext) {
    return this.run(context, "slayers");
  }

  @SubCommand({
    description: (t) => t("commands.skyblock-dungeons"),
    args: [PlayerArgument],
  })
  public dungeons(context: CommandContext) {
    return this.run(context, "dungeons");
  }

  @SubCommand({
    description: (t) => t("commands.skyblock-accessories"),
    args: [PlayerArgument],
  })
  public accessories(context: CommandContext) {
    return this.run(context, "accessories");
  }

  @SubCommand({
    description: (t) => t("commands.skyblock-level"),
    args: [PlayerArgument],
  })
  public level(context: CommandContext) {
    return this.run(context, "level");
  }

  @SubCommand({
    description: (t) => t("commands.skyblock-crimson"),
    args: [PlayerArgument],
  })
  public crimson(context: CommandContext) {
    return this.run(context, "crimson");
  }

  @SubCommand({
    description: (t) => t("commands.skyblock-fishing"),
    args: [PlayerArgument],
  })
  public fishing(context: CommandContext) {
    return this.run(context, "fishing");
  }

  @SubCommand({
    description: (t) => t("commands.skyblock-jacob"),
    args: [PlayerArgument],
  })
  public jacob(context: CommandContext) {
    return this.run(context, "jacob");
  }

  @SubCommand({
    description: (t) => t("commands.skyblock-chocolate"),
    args: [PlayerArgument],
  })
  public chocolate(context: CommandContext) {
    return this.run(context, "chocolate");
  }

  @SubCommand({
    description: (t) => t("commands.skyblock-hotf"),
    args: [PlayerArgument],
  })
  public hotf(context: CommandContext) {
    return this.run(context, "hotf");
  }

  @SubCommand({
    description: (t) => t("commands.skyblock-price"),
    args: [new ItemArgument()],
  })
  public async price(context: CommandContext): Promise<IMessage> {
    const user = context.getUser();
    const price = await this.apiService.getSkyBlockPrice(
      context.option("item"),
    );

    const [icon, logo, background] = await Promise.all([
      price.texture && getItemIcon(price.texture, { size: PRICE_ICON_SIZE }),
      getLogo(user),
      getSkyBlockBackground(),
    ]);

    const canvas = render(
      <SkyBlockPriceProfile
        price={price}
        icon={icon}
        background={background}
        logo={logo}
        user={user}
        t={context.t()}
      />,
      getTheme(user),
    );

    return {
      files: [
        {
          name: "price.png",
          data: await canvas.toBuffer("png"),
          type: "image/png",
        },
      ],
    };
  }

  private async run(context: CommandContext, name: SkyBlockCardName) {
    const card: SkyBlockCard = SKYBLOCK_CARDS[name];
    const user = context.getUser();
    const player = await this.apiService.getSkyBlockProfiles(
      context.option("player"),
      user,
    );

    const summaries = player.profiles.toSorted(
      (a, b) => Number(b.selected) - Number(a.selected),
    );
    if (summaries.length === 0)
      throw new ErrorMessage("errors.skyblockNoProfiles");

    const views = new Map<string, Promise<SkyBlockProfileView>>();
    const getView = (id: string) => {
      if (!views.has(id)) {
        const view = this.apiService.getSkyBlockProfile(
          player.uuid,
          card.sections,
          user,
          id,
        );
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

    const generator =
      (id: string, Profile: SkyBlockProfile, getIcons = card.icons) =>
      async (t: LocalizeFunction) => {
        const view = await getView(id);
        const icons = await loadItemIcons(getIcons?.(view.member) ?? []);
        const title = getSkyBlockTitle(t, view, name);

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
          getTheme(user),
        );

        return new Message({
          content: getNotes(t, view, card),
          files: [
            {
              name: "skyblock.png",
              data: await canvas.toBuffer("png"),
              type: "image/png",
            },
          ],
          attachments: [],
          embeds: [],
        });
      };

    const pages: Page[] = summaries.map(({ id, cuteName, gameMode }) => {
      const page = { label: cuteName, emoji: GAME_MODE_EMOJI[gameMode] };

      if (Array.isArray(card.profile)) {
        const subPages = card.profile.map(({ label, profile, icons }) => ({
          label,
          generator: generator(id, profile, icons),
        }));
        return { ...page, subPages };
      }

      return { ...page, generator: generator(id, card.profile) };
    });

    return paginate(context, pages, { menu: true });
  }
}
