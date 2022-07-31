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
  IMessage,
  ModalBuilder,
  TextInputBuilder,
} from "@statsify/discord";
import {
  ButtonStyle,
  InteractionResponseType,
  TextInputStyle,
} from "discord-api-types/v10";
import { DateTime, IANAZone } from "luxon";
import { User } from "@statsify/schemas";

@Command({ description: (t) => t("commands.reset") })
export class ResetCommand {
  public constructor(private readonly apiService: ApiService) {}

  public run(context: CommandContext): IMessage {
    const t = context.t();
    const user = context.getUser();

    if (!user?.uuid) throw new ErrorMessage("verification.requiredVerification");

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

    const isPremium = User.isIron(user);

    if (isPremium) {
      listener.addHook(resetButton.getCustomId(), () => ({
        type: InteractionResponseType.Modal,
        data: resetMinuteModal.build(t),
      }));

      listener.addHook(resetMinuteModal.getCustomId(), async (interaction) => {
        if (user.locale) interaction.setLocale(user.locale);

        const data = interaction.getData();

        const timeInput = data.components[0].components[0].value.toUpperCase();

        const timeZoneInput =
          data.components[1].components[0].value?.toUpperCase() ||
          new IANAZone("America/New_York");

        let time = DateTime.fromFormat(timeInput, timeFormat, {
          zone: timeZoneInput,
        }).toLocal();

        if (time.invalidExplanation) {
          const error = time.invalidExplanation.startsWith("the zone")
            ? new ErrorMessage(
                (t) => t("errors.invalidResetTimezone.title"),
                (t) =>
                  t("errors.invalidResetTimezone.description", {
                    timezone: timeZoneInput,
                  })
              )
            : new ErrorMessage(
                (t) => t("errors.invalidResetTime.title"),
                (t) => t("errors.invalidResetTime.description", { time: timeInput })
              );

          return interaction.sendFollowup({
            ...error,
            ephemeral: true,
          });
        }

        time = time.isInDST ? time.minus({ hours: 1 }) : time;

        const resetMinute = time.hour * 60 + time.minute;
        await this.apiService.resetPlayerHistorical(user.uuid!, resetMinute);

        clearTimeout(removeComponentsTimeout);

        await context.reply({
          content: (t) =>
            t("historical.setResetTime", { time: Math.round(time.toMillis() / 1000) }),
          components: [],
          ephemeral: true,
        });
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
