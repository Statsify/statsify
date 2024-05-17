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
  MemberService,
  PlayerArgument,
} from "@statsify/discord";
import { STATUS_COLORS } from "@statsify/logger";
import { UserTier } from "@statsify/schemas";
import { config } from "@statsify/util";

@Command({
  description: (t) => t("commands.force-unverify"),
  args: [new PlayerArgument("player", true)],
  tier: UserTier.STAFF,
  userCommand: false,
})
export class ForceUnverifyCommand {
  public constructor(
    private readonly apiService: ApiService,
    private readonly memberService: MemberService
  ) {}

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

    await this.memberService
      .addRole(config("supportBot.guild"), user.id, config("supportBot.memberRole"))
      .then(() => this.apiService.updateUser(user.id, { serverMember: false }))
      .catch(() => null);

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
