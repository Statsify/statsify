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
  ModalBuilder,
  TextInputBuilder,
} from "@statsify/discord";
import { ButtonStyle, InteractionResponseType } from "discord-api-types/v10";
import { CommandListener } from "#lib/command.listener";
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
    const userId = context.getInteraction().getUserId();
    const user = context.getUser();
    const t = context.t();
    const cache = new Map<number, IMessage>();

    const logo = await getLogo(user);

    const props: BaseLeaderboardProps = {
      t,
      background,
      logo,
      user,
      type,
    };

    const up = new ButtonBuilder()
      .emoji(t("emojis:up"))
      .style(ButtonStyle.Success)
      .disable(true);

    const down = new ButtonBuilder().emoji(t("emojis:down")).style(ButtonStyle.Danger);

    const searchDocument = new ButtonBuilder()
      .emoji(t(`emojis:search.${type}`))
      .style(ButtonStyle.Primary);

    const searchPosition = new ButtonBuilder()
      .emoji(t("emojis:search.position"))
      .style(ButtonStyle.Primary);

    let currentPage = 0;

    const changePage =
      (fn: () => LeaderboardParams) => async (interaction: Interaction) => {
        if (user?.locale) interaction.setLocale(user.locale);

        const params = fn();

        const [message, page] = await this.getLeaderboardMessage(
          user,
          cache,
          type,
          getLeaderboard,
          field,
          params,
          props,
          getLeaderboardDataIcon
        );

        if (interaction.getUserId() === userId && !message.ephemeral) {
          up.disable(page === 0);
          currentPage = page || currentPage;
          const row = new ActionRowBuilder([up, down, searchDocument, searchPosition]);

          context.reply({
            ...message,
            components: [row],
            attachments: [],
          });
        } else {
          interaction.sendFollowup({ ...message, ephemeral: true });
        }
      };

    const listener = CommandListener.getInstance();

    listener.addHook(
      up.getCustomId(),
      changePage(() => ({
        input: currentPage - 1,
        type: LeaderboardQuery.PAGE,
      }))
    );

    listener.addHook(
      down.getCustomId(),
      changePage(() => ({
        input: currentPage + 1,
        type: LeaderboardQuery.PAGE,
      }))
    );

    const documentModal = new ModalBuilder()
      .title((t) => t("leaderboard.modal.title"))
      .component(
        new ActionRowBuilder().component(
          new TextInputBuilder()
            .label((t) => t(`leaderboard.${type}Input.label`))
            .placeholder((t) => t(`leaderboard.${type}Input.placeholder`))
            .minLength(1)
            .maxLength(type === "player" ? 16 : 36)
            .required(true)
        )
      );

    const positionModal = new ModalBuilder()
      .title((t) => t("leaderboard.modal.title"))
      .component(
        new ActionRowBuilder().component(
          new TextInputBuilder()
            .label((t) => t("leaderboard.positionInput.label"))
            .placeholder((t) => t("leaderboard.positionInput.placeholder"))
            .minLength(1)
            .maxLength(6)
            .required(true)
        )
      );

    listener.addHook(searchDocument.getCustomId(), () => ({
      type: InteractionResponseType.Modal,
      data: documentModal.build(t),
    }));

    listener.addHook(searchPosition.getCustomId(), () => ({
      type: InteractionResponseType.Modal,
      data: positionModal.build(t),
    }));

    listener.addHook(documentModal.getCustomId(), async (interaction) => {
      const data = interaction.getData();
      const documentInput = data.components[0].components[0].value;
      changePage(() => ({ input: documentInput, type: LeaderboardQuery.INPUT }))(
        interaction
      );
    });

    listener.addHook(positionModal.getCustomId(), async (interaction) => {
      const data = interaction.getData();
      const positionInput = data.components[0].components[0].value;

      const position = Number.parseInt(positionInput, 10);

      if (user?.locale) interaction.setLocale(user.locale);

      if (Number.isNaN(position) || position < 1) {
        const error = new ErrorMessage("errors.leaderboardInvalidPosition");

        return interaction.sendFollowup({
          ...error,
          ephemeral: true,
        });
      }

      changePage(() => ({ input: position, type: LeaderboardQuery.POSITION }))(
        interaction
      );
    });

    const row = new ActionRowBuilder([up, down, searchDocument, searchPosition]);

    const [message, page] = await this.getLeaderboardMessage(
      user,
      cache,
      type,
      getLeaderboard,
      field,
      { input: currentPage, type: LeaderboardQuery.PAGE },
      props,
      getLeaderboardDataIcon
    );

    if (message.ephemeral) return message;

    setTimeout(() => {
      listener.removeHook(up.getCustomId());
      listener.removeHook(down.getCustomId());
      listener.removeHook(searchDocument.getCustomId());
      listener.removeHook(searchPosition.getCustomId());
      listener.removeHook(documentModal.getCustomId());
      listener.removeHook(positionModal.getCustomId());

      context.reply({ embeds: [], components: [] });
      cache.clear();
    }, 300_000);
     
    currentPage = page || currentPage;

    return { ...message, components: [row] };
  }

  private async getLeaderboardMessage(
    user: User | null,
    cache: Map<number, IMessage>,
    type: LeaderboardType,
    getLeaderboard: GetLeaderboard,
    field: string,
    params: LeaderboardParams,
    props: BaseLeaderboardProps,
    getLeaderboardDataIcon?: GetLeaderboardDataIcon
  ): Promise<[message: IMessage, page: number | null]> {
    if (params.type === LeaderboardQuery.PAGE && cache.has(params.input as number)) {
      const page = params.input as number;
      return [cache.get(page)!, page];
    }

    const [message, page] = await this.renderLeaderboardMessage(
      user,
      type,
      getLeaderboard,
      field,
      params,
      props,
      getLeaderboardDataIcon
    );

    if (params.type === LeaderboardQuery.PAGE && page) cache.set(page, message);

    return [message, page];
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

    if (!leaderboard.data.length) {
      const message = {
        ...new ErrorMessage("errors.leaderboardEmpty"),
        ephemeral: true,
      };

      return [message, null];
    }

    const leaderboardData = getLeaderboardDataIcon
      ? await Promise.all(
        leaderboard.data.map(async (d) => ({
          ...d,
          icon: await getLeaderboardDataIcon(d.id),
        }))
      )
      : leaderboard.data;

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
