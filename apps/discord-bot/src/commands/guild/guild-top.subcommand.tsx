/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  ActionRowBuilder,
  ButtonBuilder,
  CommandContext,
  GuildArgument,
  IMessage,
  Interaction,
  SelectMenuBuilder,
  SelectMenuOptionBuilder,
  SubCommand,
} from "@statsify/discord";
import { ButtonStyle } from "discord-api-types/v10";
import { CommandListener } from "#lib/command.listener";
import {
  GUILD_TOP_PAGE_SIZE,
  GuildTopMember,
  GuildTopProfile,
  GuildTopProfileProps,
} from "./guild-top.profile.js";
import { GuildLeaderboardSubCommand } from "../leaderboards/guild-leaderboard.subcommand.js";
import { GuildQuery } from "@statsify/api-client";
import { Theme, render } from "@statsify/rendering";
import { getBackground, getLogo } from "@statsify/assets";
import { getTheme } from "#themes";

type BaseGuildTopProfileProps = Omit<GuildTopProfileProps, "page" | "members" | "title">;
type GuildTopKey = "daily" | "weekly" | "monthly" | number;

interface GuildTopPageState {
  modeIndex: number;
  page: number;
}

export class GuildTopSubCommand extends GuildLeaderboardSubCommand {
  @SubCommand({ description: (t) => t("commands.guild-top"), args: GuildArgument })
  public async top(context: CommandContext) {
    const userId = context.getInteraction().getUserId();
    const user = context.getUser();
    const t = context.t();

    const guild = await this.getGuild(context);

    const [logo, background] = await Promise.all([
      getLogo(user),
      getBackground("hypixel", "overall"),
    ]);

    const props: BaseGuildTopProfileProps = {
      guild,
      background,
      logo,
      user,
      t,
    };

    const theme = getTheme(user);

    const up = new ButtonBuilder().emoji(t("emojis:up")).style(ButtonStyle.Success);
    const down = new ButtonBuilder().emoji(t("emojis:down")).style(ButtonStyle.Danger);

    const modes: [GuildTopKey, string][] = [
      ["daily", "Today"],
      ["weekly", "This Week"],
      ["monthly", "This Month"],
      [1, "Yesterday"],
      [2, "3 days ago"],
      [3, "4 days ago"],
      [4, "5 days ago"],
      [5, "6 days ago"],
      [6, "7 days ago"],
    ];

    const dropdown = new SelectMenuBuilder();

    modes.forEach(([key, title], index) =>
      dropdown.option(
        new SelectMenuOptionBuilder()
          .label(title)
          .value(`${key}`)
          .default(index === 0)
      )
    );

    const components = [new ActionRowBuilder().component(dropdown)];

    const pageCount = Math.ceil(guild.members.length / GUILD_TOP_PAGE_SIZE);
    if (pageCount > 1)
      components.push(new ActionRowBuilder().component(up).component(down));

    let page = 0;
    let modeIndex = 0;

    const cache = new Map<string, Buffer>();
    const listener = CommandListener.getInstance();

    const changePage =
      (fn: (interaction: Interaction) => Partial<GuildTopPageState>) =>
        async (interaction: Interaction) => {
          if (user?.locale) interaction.setLocale(user.locale);

          const state = fn(interaction);

          const mode = modes[state.modeIndex ?? modeIndex];

          const message = await this.getGuildTopPageMessage(
            cache,
            components,
            props,
            mode[1],
            mode[0],
            state.page ?? page,
            theme
          );

          if (interaction.getUserId() === userId) {
            if (state.page !== undefined) page = state.page;
            if (state.modeIndex !== undefined) modeIndex = state.modeIndex;

            dropdown.activeOption(modeIndex);

            context.reply(message);
          } else {
            interaction.sendFollowup({ ...message, components: [], ephemeral: true });
          }
        };

    listener.addHook(
      up.getCustomId(),
      changePage(() => ({ page: page - 1 < 0 ? pageCount - 1 : page - 1 }))
    );

    listener.addHook(
      down.getCustomId(),
      changePage(() => ({ page: page + 1 > pageCount - 1 ? 0 : page + 1 }))
    );

    listener.addHook(
      dropdown.getCustomId(),
      changePage((interaction) => {
        const value = interaction.getData().values[0] as GuildTopKey;
        return { modeIndex: modes.findIndex((m) => m[0] == value) };
      })
    );

    setTimeout(() => {
      context.reply({ components: [] });
      cache.clear();

      listener.removeHook(up.getCustomId());
      listener.removeHook(down.getCustomId());
      listener.removeHook(dropdown.getCustomId());
    }, 300_000);

    const message = await this.getGuildTopPageMessage(
      cache,
      components,
      props,
      modes[modeIndex][1],
      modes[modeIndex][0],
      page,
      theme
    );

    return message;
  }

  protected getGuild(context: CommandContext) {
    const user = context.getUser();
    const query = context.option<string>("query");
    const type = context.option<GuildQuery>("type");

    return this.apiService.getGuild(query, type, user);
  }

  private async getGuildTopPageMessage(
    cache: Map<string, Buffer>,
    components: ActionRowBuilder[],
    props: BaseGuildTopProfileProps,
    title: string,
    key: GuildTopKey,
    page: number,
    theme?: Theme
  ): Promise<IMessage> {
    const cacheKey = `${key}-${page}`;

    let image: Buffer;

    if (cache.has(cacheKey)) {
      image = cache.get(cacheKey)!;
    } else {
      image = await this.generateGuildTopPage(props, title, key, page, theme);
      cache.set(cacheKey, image);
    }

    return {
      files: [{ name: "guild-top.png", data: image, type: "image/png" }],
      attachments: [],
      components,
    };
  }

  private async generateGuildTopPage(
    props: BaseGuildTopProfileProps,
    title: string,
    key: GuildTopKey,
    page: number,
    theme?: Theme
  ) {
    const members = props.guild.members
      .map(
        (m) =>
          ({
            name: m.displayName,
            value: typeof key === "string" ? m[key] : m.expHistory[key],
          } as GuildTopMember)
      )
      .sort((a, b) => b.value - a.value)
      .slice(page * GUILD_TOP_PAGE_SIZE, (page + 1) * GUILD_TOP_PAGE_SIZE);

    const canvas = render(
      <GuildTopProfile {...props} members={members} title={title} page={page} />,
      theme
    );

    const buffer = await canvas.toBuffer("png");

    return buffer;
  }
}
