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
  EmbedBuilder,
  ErrorMessage,
  IMessage,
  SubCommand,
} from "@statsify/discord";
import { ButtonStyle } from "discord-api-types/v10";
import { STATUS_COLORS } from "@statsify/logger";
import { confirmAction } from "#lib/confirm-action";

interface SessionChange {
  /** Locale key of the warning shown before the change */
  warning: string;
  /** Locale key of the button that makes the change */
  button: string;
  onConfirm: (uuid: string) => Promise<IMessage>;
}

/**
 * Not an async function: the command loader treats exports without a writable prototype as commands.
 */
export function confirmSessionChange(
  context: CommandContext,
  apiService: ApiService,
  { warning, button, onConfirm }: SessionChange
): Promise<IMessage> {
  const uuid = context.getUser()?.uuid;
  if (!uuid) throw new ErrorMessage("verification.requiredVerification");

  // Without a user uuid this only reads an existing session and never starts one
  return apiService
    .getPlayerSession(uuid)
    .then(({ sessionReset }) => sessionReset, () => undefined)
    .then((started) => {
      const embed = new EmbedBuilder()
        .color(STATUS_COLORS.warn)
        .description((t) =>
          started ?
            `${t(warning)}\n\n${t("historical.sessionStarted", { time: started })}` :
            t(warning)
        );

      return confirmAction(context, {
        prompt: { embeds: [embed], ephemeral: true },
        confirmLabel: (t) => t(button),
        confirmStyle: ButtonStyle.Danger,
        onConfirm: () => onConfirm(uuid),
      });
    });
}

@Command({ description: "Reset" })
export class ResetCommand {
  public constructor(private readonly apiService: ApiService) {}

  @SubCommand({ description: (t) => t("commands.reset-session") })
  public session(context: CommandContext): Promise<IMessage> {
    return confirmSessionChange(context, this.apiService, {
      warning: "historical.resetSessionWarning",
      button: "historical.resetSessionButton",
      onConfirm: async (uuid) => {
        await this.apiService.resetPlayerSession(uuid);

        const embed = new EmbedBuilder()
          .color(STATUS_COLORS.success)
          .description((t) => t("historical.setSessionReset"));

        return { embeds: [embed] };
      },
    });
  }
}
