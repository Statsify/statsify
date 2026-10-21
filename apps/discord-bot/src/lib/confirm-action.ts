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
  type CommandContext,
  ErrorMessage,
  type IMessage,
  type Interaction,
  type LocalizationString,
  Message,
} from "@statsify/discord";
import { ButtonStyle } from "discord-api-types/v10";
import { Logger } from "@statsify/logger";

const logger = new Logger("ConfirmAction");

export interface ConfirmActionOptions {
  prompt: IMessage;
  confirmLabel: LocalizationString;
  confirmStyle?: ButtonStyle;
  onConfirm: () => Promise<IMessage>;
}

export function confirmAction(
  context: CommandContext,
  { prompt, confirmLabel, confirmStyle = ButtonStyle.Success, onConfirm }: ConfirmActionOptions
): IMessage {
  const t = context.t();
  const userId = context.getInteraction().getUserId();
  const listener = context.getListener();

  const confirmButton = new ButtonBuilder()
    .label(confirmLabel)
    .emoji(t("emojis:check"))
    .style(confirmStyle);

  const cancelButton = new ButtonBuilder()
    .label((t) => t("confirm.cancel"))
    .emoji(t("emojis:cross"))
    .style(ButtonStyle.Secondary);

  const timeout = setTimeout(() => {
    close();
    context.reply({ content: (t) => t("confirm.expired"), components: [] });
  }, 300_000);

  function close() {
    clearTimeout(timeout);
    listener.removeHook(confirmButton.getCustomId());
    listener.removeHook(cancelButton.getCustomId());
  }

  const ownerOnly = (run: () => Promise<IMessage>) => async (interaction: Interaction) => {
    if (interaction.getUserId() !== userId)
      return interaction.sendFollowup({ ...new ErrorMessage("errors.notCommandOwner"), ephemeral: true });

    // Remove the hooks before running anything, so a second press can't run it twice
    close();

    const message = await run().catch((error): IMessage => {
      if (!(error instanceof Message)) logger.error(error);
      const errorMessage = error instanceof Message ? error : new ErrorMessage("errors.unknown");
      return { ...errorMessage, content: "", attachments: [] };
    });

    return context.reply({ ...message, components: [] });
  };

  listener.addHook(confirmButton.getCustomId(), ownerOnly(onConfirm));

  listener.addHook(
    cancelButton.getCustomId(),
    ownerOnly(async () => ({ content: (t) => t("confirm.cancelled"), embeds: [], attachments: [] }))
  );

  return { ...prompt, components: [new ActionRowBuilder([confirmButton, cancelButton])] };
}
