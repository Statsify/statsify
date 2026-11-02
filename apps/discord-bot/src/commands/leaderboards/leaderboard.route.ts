/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  AbstractCommandListener,
  ActionRowBuilder,
  ComponentRoute,
  ModalBuilder,
  TextInputBuilder,
} from "@statsify/discord";
import { InteractionResponseType } from "discord-api-types/v10";
import { LeaderboardQuery } from "@statsify/api-client";
import type { LeaderboardType } from "./leaderboard.profile.js";

/**
 * Leaderboard buttons and search modals re-run `/leaderboard <subcommand>`:
 * `lb:<user id>:<page, input or position>:<subcommand>.<leaderboard>`
 */
export const LEADERBOARD_ROUTE = "lb";

export function leaderboardRoute(listener: AbstractCommandListener): ComponentRoute {
  return (interaction, { ownerId, values: [action, leaderboard] }) => {
    const [subcommand, ...key] = leaderboard.split(".");

    // The modal takes the button's custom id, so submitting it comes back here to search
    if (
      interaction.isButtonInteraction() &&
      (action === LeaderboardQuery.INPUT || action === LeaderboardQuery.POSITION)
    ) {
      return {
        type: InteractionResponseType.Modal,
        data: getSearchModal(subcommand === "guild" ? "guild" : "player", action)
          .customId(interaction.getCustomId())
          .build(interaction.t()),
      };
    }

    return listener.rerunCommand(interaction, ownerId, ["leaderboard", subcommand], {
      leaderboard: key.join("."),
    });
  };
}

function getSearchModal(type: LeaderboardType, search: LeaderboardQuery.INPUT | LeaderboardQuery.POSITION) {
  const input =
    search === LeaderboardQuery.INPUT ?
      new TextInputBuilder()
        .label((t) => t(`leaderboard.${type}Input.label`))
        .placeholder((t) => t(`leaderboard.${type}Input.placeholder`))
        .maxLength(type === "player" ? 16 : 36) :
      new TextInputBuilder()
        .label((t) => t("leaderboard.positionInput.label"))
        .placeholder((t) => t("leaderboard.positionInput.placeholder"))
        .maxLength(6);

  return new ModalBuilder()
    .title((t) => t("leaderboard.modal.title"))
    .component(new ActionRowBuilder().component(input.minLength(1).required(true)));
}
