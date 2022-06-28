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
  PlayerArgument,
} from "@statsify/discord";
import { STATUS_COLORS } from "@statsify/logger";
import { UserTier } from "@statsify/schemas";

@Command({
  description: (t) => t("commands.force-unverify"),
  args: [new PlayerArgument("player", true)],
  tier: UserTier.STAFF,
})
export class ForceUnverifyCommand {
  public constructor(private readonly apiService: ApiService) {}

  public async run(context: CommandContext) {
    const player = await this.apiService.getPlayer(context.option("player"));

    const user = await this.apiService.unverifyUser(player.uuid);

    if (!user)
      throw new ErrorMessage(
        (t) => t("errors.missingPlayerVerification.title"),
        (t) =>
          t("errors.missingPlayerVerification.description", {
            displayName: this.apiService.emojiDisplayName(t, player.displayName),
          })
      );

    const embed = new EmbedBuilder()
      .color(STATUS_COLORS.success)
      .title((t) => t("embeds.forceUnverify.title"))
      .description((t) =>
        t("embeds.forceUnverify.description", {
          id: user.id,
          displayName: this.apiService.emojiDisplayName(t, player.displayName),
        })
      );

    return { embeds: [embed] };
  }
}
