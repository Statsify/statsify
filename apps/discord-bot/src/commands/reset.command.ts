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
  Command,
  CommandContext,
  IMessage,
  ModalBuilder,
  TextInputBuilder,
} from "@statsify/discord";
import { ApiService } from "#services";
import {
  ButtonStyle,
  InteractionResponseType,
  TextInputStyle,
} from "discord-api-types/v10";
import { DateTime } from "luxon";
import { ErrorMessage } from "#lib/error.message";
import { User } from "@statsify/schemas";

@Command({ description: (t) => t("commands.reset") })
export class ResetCommand {
  public constructor(private readonly apiService: ApiService) {}

  public run(context: CommandContext): IMessage {
    const t = context.t();
    const user = context.getUser();

    if (!user?.uuid)
      throw new ErrorMessage(
        (t) => t("verification.requiredVerification.title"),
        (t) => t("verification.requiredVerification.description")
      );

    const resetButton = new ButtonBuilder()
      .label((t) => t("historical.resetButton"))
      .style(ButtonStyle.Danger)
      .emoji(t("emojis:reset"));

    const timeFormat = "h:mm a";
    const now = DateTime.now();
    const timeZone = now.zone;

    const resetMinuteModal = new ModalBuilder()
      .title((t) => t("historical.modal.title"))
      .component(
        new ActionRowBuilder().component(
          new TextInputBuilder()
            .label((t) => t("historical.modal.resetTime"))
            .minLength(5)
            .maxLength(8)
            .placeholder(now.toFormat(timeFormat))
            .required(true)
            .style(TextInputStyle.Short)
        )
      )
      .component(
        new ActionRowBuilder().component(
          new TextInputBuilder()
            .label((t) => t("historical.modal.timezone"))
            .minLength(1)
            .maxLength(6)
            .placeholder(timeZone.offsetName(0, { format: "short" }))
            .required(false)
            .style(TextInputStyle.Short)
        )
      );

    const listener = context.getListener();

    const removeComponentsTimeout = setTimeout(() => {
      context.reply({ components: [] });
      listener.removeHook(resetButton.getCustomId());
      listener.removeHook(resetMinuteModal.getCustomId());
    }, 300_000);

    const isPremium = User.isPremium(user.tier);

    if (isPremium) {
      listener.addHook(resetButton.getCustomId(), () => ({
        type: InteractionResponseType.Modal,
        data: resetMinuteModal.build(t),
      }));

      listener.addHook(resetMinuteModal.getCustomId(), async (interaction) => {
        const data = interaction.getData();

        const timeInput = data.components[0].components[0].value;
        const timeZoneInput = data.components[1].components[0].value ?? timeZone.name;

        let time = DateTime.fromFormat(timeInput, timeFormat, {
          zone: timeZoneInput,
        }).toLocal();

        if (time.invalidExplanation) {
          return interaction.sendFollowup({
            content: time.invalidExplanation,
            ephemeral: true,
          });
        }

        time = time.isInDST ? time.minus({ hours: 1 }) : time;

        const resetMinute = time.hour * 60 + time.minute;
        await this.apiService.resetPlayerHistorical(user.uuid!, resetMinute);

        await interaction.sendFollowup({
          content: (t) =>
            t("historical.setResetTime", { time: Math.round(time.toMillis() / 1000) }),
          ephemeral: true,
        });

        clearTimeout(removeComponentsTimeout);
        await context.getInteraction().deleteReply();
      });
    } else {
      listener.addHook(resetButton.getCustomId(), async () => {
        clearTimeout(removeComponentsTimeout);
        await this.apiService.resetPlayerHistorical(user.uuid!);
        context.reply({
          content: (t) =>
            t("historical.setResetTime", { time: Math.round(Date.now() / 1000) }),
          components: [],
        });
      });
    }

    return {
      content: (t) =>
        t(`historical.${isPremium ? "aboutResettingPremium" : "aboutResetting"}`),
      components: [new ActionRowBuilder().component(resetButton)],
      ephemeral: true,
    };
  }
}
