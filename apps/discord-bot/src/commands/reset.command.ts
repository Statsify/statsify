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
import { STATUS_COLORS } from "@statsify/logger";

@Command({ description: "Reset" })
export class ResetCommand {
  public constructor(private readonly apiService: ApiService) {}

  @SubCommand({ description: (t) => t("commands.reset-session")  })
  public async session(context: CommandContext): Promise<IMessage> {
    const user = context.getUser();
    if (!user?.uuid) throw new ErrorMessage("verification.requiredVerification");

    await this.apiService.resetPlayerSession(
      user.uuid!
    );

    const embed = new EmbedBuilder()
      .color(STATUS_COLORS.success)
      .description((t) => t("historical.setSessionReset"));

    return {
      embeds: [embed],
      ephemeral: true,
    };
  }
}
