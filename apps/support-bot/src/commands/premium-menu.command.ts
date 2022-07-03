/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Command, EmbedBuilder, IMessage, MessageService } from "@statsify/discord";
import { STATUS_COLORS } from "@statsify/logger";
import { UserTier } from "@statsify/schemas";
import { config } from "@statsify/util";

@Command({ description: (t) => t("commands.premium-menu"), tier: UserTier.CORE })
export class PremiumMenuCommand {
  public constructor(private readonly messageService: MessageService) {}

  public async run(): Promise<IMessage> {
    //TODO: write this message
    const embed = new EmbedBuilder().title("Statsify Premium").color(STATUS_COLORS.info);

    await this.messageService.send(config("supportBot.premiumInfoChannel"), {
      embeds: [embed],
    });

    return {
      content: "Premium Message Sent",
      ephemeral: true,
    };
  }
}
