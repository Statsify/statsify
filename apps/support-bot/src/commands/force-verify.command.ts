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
  UserArgument,
} from "@statsify/discord";
import { STATUS_COLORS } from "@statsify/logger";
import { UserTier } from "@statsify/schemas";

@Command({
  description: (t) => t("commands.force-verify"),
  args: [new UserArgument(), new PlayerArgument("player", true)],
  tier: UserTier.STAFF,
})
export class ForceVerifyCommand {
  public constructor(private readonly apiService: ApiService) {}

  public async run(context: CommandContext) {
    const userId = context.option<string>("user");
    const player = await this.apiService.getPlayer(context.option("player"));

    const user = await this.apiService.verifyUser(player.uuid, userId);

    if (!user) throw new ErrorMessage("errors.unknown");

    const embed = new EmbedBuilder()
      .color(STATUS_COLORS.success)
      .title((t) => t("embeds.forceVerify.title"))
      .description((t) =>
        t("embeds.forceVerify.description", {
          id: user.id,
          displayName: this.apiService.emojiDisplayName(t, player.displayName),
        })
      );

    return { embeds: [embed] };
  }
}
