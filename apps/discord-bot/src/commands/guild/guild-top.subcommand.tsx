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
  Interaction,
  SelectMenuBuilder,
  SelectMenuOptionBuilder,
  SubCommand,
  createCustomId,
  getScrolledPage,
  parseCustomId,
} from "@statsify/discord";
import { ButtonStyle } from "discord-api-types/v10";
import { GUILD_ROUTE } from "./guild.route.js";
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
type GuildTopMode = [key: GuildTopKey, title: string];

export class GuildTopSubCommand extends GuildLeaderboardSubCommand {
  @SubCommand({ description: (t) => t("commands.guild-top"), args: GuildArgument })
  public async top(context: CommandContext) {
    const interaction = context.getInteraction();
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

    const modes: GuildTopMode[] = [
      ["daily", "Today"],
      ["weekly", "This Week"],
      ["monthly", "This Month"],
      [1, "Yesterday"],
      [2, "2 days ago"],
      [3, "3 days ago"],
      [4, "4 days ago"],
      [5, "5 days ago"],
      [6, "6 days ago"],
    ];

    const pageCount = Math.ceil(guild.members.length / GUILD_TOP_PAGE_SIZE);
    const [modeIndex, page] = this.getRequestedPage(interaction, modes, pageCount);
    const [key, title] = modes[modeIndex];

    const getCustomId = (...values: (string | number)[]) =>
      createCustomId(GUILD_ROUTE, interaction.getUserId(), context.getCommandName(), guild.id, ...values);

    const dropdown = new SelectMenuBuilder().customId(getCustomId("menu", page));

    for (const [index, [key, title]] of modes.entries()) {
      dropdown.option(
        new SelectMenuOptionBuilder()
          .label(title)
          .value(`${key}`)
          .default(index === modeIndex)
      );
    }

    const components = [new ActionRowBuilder().component(dropdown)];

    if (pageCount > 1)
      components.push(
        new ActionRowBuilder()
          .component(
            new ButtonBuilder()
              .emoji(t("emojis:up"))
              .style(ButtonStyle.Success)
              .customId(getCustomId(key, `prev.${page}`))
          )
          .component(
            new ButtonBuilder()
              .emoji(t("emojis:down"))
              .style(ButtonStyle.Danger)
              .customId(getCustomId(key, `next.${page}`))
          )
      );

    const image = await this.generateGuildTopPage(props, title, key, page, getTheme(user));

    return {
      files: [{ name: "guild-top.png", data: image, type: "image/png" }],
      attachments: [],
      components,
    };
  }

  protected getGuild(context: CommandContext) {
    const user = context.getUser();
    const query = context.option<string>("query");
    const type = context.option<GuildQuery>("type");

    return this.apiService.getGuild(query, type, user, context.getCacheLevel());
  }

  /** Today's first page for the command, otherwise the mode and page a click asks for */
  private getRequestedPage(
    interaction: Interaction,
    modes: GuildTopMode[],
    pageCount: number
  ): [modeIndex: number, page: number] {
    if (!interaction.isMessageComponentInteraction()) return [0, 0];

    const [, , key, target] = parseCustomId(interaction.getCustomId()).values;
    const findMode = (key: string) => modes.findIndex(([mode]) => `${mode}` === key);

    if (interaction.isSelectMenuInteraction())
      return [findMode(interaction.getData().values[0]), Number(target)];

    return [findMode(key), getScrolledPage(target, pageCount)];
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
