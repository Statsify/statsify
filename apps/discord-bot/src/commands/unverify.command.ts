/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiService } from "#services";
import { Command, CommandContext, EmbedBuilder, IMessage } from "@statsify/discord";
import { ErrorMessage } from "#lib/error.message";
import { SUCCESS_COLOR } from "#constants";

@Command({ description: (t) => t("commands.unverify"), cooldown: 5 })
export class UnverifyCommand {
  public constructor(private readonly apiService: ApiService) {}

  public async run(context: CommandContext): Promise<IMessage> {
    const userId = context.getInteraction().getUserId();
    const user = context.getUser();

    if (!user?.uuid)
      throw new ErrorMessage(
        (t) => t("verification.notVerified.title"),
        (t) => t("verification.notVerified.description")
      );

    await this.apiService.unverifyUser(userId);

    const embed = new EmbedBuilder()
      .description((t) => t("verification.successfulUnverification"))
      .color(SUCCESS_COLOR);

    return {
      embeds: [embed],
    };
  }
}
