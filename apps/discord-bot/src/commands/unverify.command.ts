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
} from "@statsify/discord";
import { STATUS_COLORS } from "@statsify/logger";

@Command({ description: (t) => t("commands.unverify"), cooldown: 5 })
export class UnverifyCommand {
  public constructor(private readonly apiService: ApiService) {}

  public async run(context: CommandContext): Promise<IMessage> {
    const userId = context.getInteraction().getUserId();
    const user = context.getUser();

    if (!user?.uuid) throw new ErrorMessage("verification.notVerified");

    await this.apiService.unverifyUser(userId);

    const embed = new EmbedBuilder()
      .description((t) => t("verification.successfulUnverification"))
      .color(STATUS_COLORS.success);

    return {
      embeds: [embed],
    };
  }
}
