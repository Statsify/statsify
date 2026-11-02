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
  ErrorMessage,
  IMessage,
  Interaction,
  createCustomId,
  parseCustomId,
} from "@statsify/discord";
import { ButtonStyle } from "discord-api-types/v10";
import { LEADERBOARD_ROUTE } from "./leaderboard.route.js";
import {
  LeaderboardProfile,
  LeaderboardProfileProps,
  LeaderboardType,
} from "./leaderboard.profile.js";
import {
  LeaderboardQuery,
  PostLeaderboardResponse,
} from "@statsify/api-client";
import { User } from "@statsify/schemas";
import { getLogo } from "@statsify/assets";
import { getTheme } from "#themes";
import { render } from "@statsify/rendering";
import type { Image } from "skia-canvas";

type BaseLeaderboardProps = Omit<LeaderboardProfileProps, "fields" | "name" | "data">;

interface LeaderboardParams {
  input: string | number;
  type: LeaderboardQuery;
}

type GetLeaderboard = (
  field: string,
  input: string | number,
  type: LeaderboardQuery
) => Promise<PostLeaderboardResponse | null>;

type GetLeaderboardDataIcon = (id: string) => Promise<Image>;

export interface CreateLeaderboardOptions {
  context: CommandContext;
  background: Image;
  type: LeaderboardType;
  getLeaderboard: GetLeaderboard;
  field: string;
  getLeaderboardDataIcon?: GetLeaderboardDataIcon;
}

export class BaseLeaderboardCommand {
  protected async createLeaderboard({
    context,
    background,
    field,
    getLeaderboard,
    type,
    getLeaderboardDataIcon,
  }: CreateLeaderboardOptions) {
    const interaction = context.getInteraction();
    const user = context.getUser();
    const t = context.t();

    const params = this.getLeaderboardParams(interaction);
    const logo = await getLogo(user);

    const props: BaseLeaderboardProps = {
      t,
      background,
      logo,
      user,
      type,
    };

    const [message, page] = await this.renderLeaderboardMessage(
      user,
      type,
      getLeaderboard,
      field,
      params,
      props,
      getLeaderboardDataIcon
    );

    if (page === null) return message;

    // Player leaderboard subcommands are named after the game in the field
    const leaderboard = type === "player" ? field.replace(/^stats\./, "") : `guild.${field}`;

    const customId = (action: string | number) =>
      createCustomId(LEADERBOARD_ROUTE, interaction.getUserId(), action, leaderboard);

    const row = new ActionRowBuilder([
      new ButtonBuilder()
        .emoji(t("emojis:up"))
        .style(ButtonStyle.Success)
        .customId(customId(page - 1))
        .disable(page === 0),
      new ButtonBuilder()
        .emoji(t("emojis:down"))
        .style(ButtonStyle.Danger)
        .customId(customId(page + 1)),
      new ButtonBuilder()
        .emoji(t(`emojis:search.${type}`))
        .style(ButtonStyle.Primary)
        .customId(customId(LeaderboardQuery.INPUT)),
      new ButtonBuilder()
        .emoji(t("emojis:search.position"))
        .style(ButtonStyle.Primary)
        .customId(customId(LeaderboardQuery.POSITION)),
    ]);

    return { ...message, components: [row], attachments: [] };
  }

  /** The first page for the command, otherwise the page or search a button or modal asks for */
  private getLeaderboardParams(interaction: Interaction): LeaderboardParams {
    if (interaction.isCommandInteraction()) return { input: 0, type: LeaderboardQuery.PAGE };

    const [action] = parseCustomId(interaction.getCustomId()).values;

    if (!interaction.isModalInteraction()) return { input: Number(action), type: LeaderboardQuery.PAGE };

    const input = interaction.getData().components[0].components[0].value;

    if (action === LeaderboardQuery.INPUT) return { input, type: LeaderboardQuery.INPUT };

    const positionInput = input.trim();
    const position = Number(positionInput);

    if (!/^\d+$/.test(positionInput) || position < 1)
      throw new ErrorMessage("errors.leaderboardInvalidPosition");

    return { input: position, type: LeaderboardQuery.POSITION };
  }

  private async renderLeaderboardMessage(
    user: User | null,
    type: LeaderboardType,
    getLeaderboard: GetLeaderboard,
    field: string,
    params: LeaderboardParams,
    props: BaseLeaderboardProps,
    getLeaderboardDataIcon?: GetLeaderboardDataIcon
  ): Promise<[message: IMessage, page: number | null]> {
    const leaderboard = await getLeaderboard(field, params.input, params.type);

    if (!leaderboard) {
      const message = {
        ...new ErrorMessage(`errors.${type}LeaderboardNotFound`),
        ephemeral: true,
      };

      return [message, null];
    }

    if (!leaderboard?.data.length) {
      const message = {
        ...new ErrorMessage("errors.leaderboardEmpty"),
        ephemeral: true,
      };

      return [message, null];
    }

    const leaderboardData = getLeaderboardDataIcon ?
      await Promise.all(
        leaderboard.data.map(async (d) => ({
          ...d,
          icon: await getLeaderboardDataIcon(d.id),
        }))
      ) :
      leaderboard.data;

    const canvas = render(
      <LeaderboardProfile
        {...props}
        name={leaderboard.name}
        fields={leaderboard.fields}
        data={leaderboardData}
      />,
      getTheme(user)
    );

    const buffer = await canvas.toBuffer("png");

    const message = {
      files: [{ name: "leaderboard.png", data: buffer, type: "image/png" }],
      embeds: [],
    };

    return [message, leaderboard.page];
  }
}
