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
  InteractionAttachment,
  MemberService,
  NumberArgument,
} from "@statsify/discord";
import { STATUS_COLORS } from "@statsify/logger";
import { config } from "@statsify/util";
import { getAssetPath } from "@statsify/assets";
import { readFileSync } from "node:fs";

@Command({
  description: (t) => t("commands.verify"),
  args: [new NumberArgument("code", 1000, 9999)],
  cooldown: 5,
})
export class VerifyCommand {
  public constructor(
    private readonly apiService: ApiService,
    private readonly memberService: MemberService
  ) {}

  public async run(context: CommandContext): Promise<IMessage> {
    const userId = context.getInteraction().getUserId();
    let user = context.getUser();

    if (user?.uuid) throw new ErrorMessage("verification.alreadyVerified");

    const code = context.option<number>("code");

    if (!code)
      throw new ErrorMessage(
        (t) => t("verification.noCode.title"),
        (t) => t("verification.noCode.description"),
        { image: this.getVerifyGif() }
      );

    user = await this.apiService.verifyUser(`${code}`, userId);

    if (!user)
      throw new ErrorMessage(
        (t) => t("verification.invalidCode.title"),
        (t) => t("verification.invalidCode.description"),
        { image: this.getVerifyGif() }
      );

    await this.memberService
      .addRole(config("supportBot.guild"), userId, config("supportBot.memberRole"))
      .then(() => this.apiService.updateUser(userId, { serverMember: true }))
      .catch(() => null);

    const player = await this.apiService.getPlayer(user?.uuid as string);
    const displayName = this.apiService.emojiDisplayName(context.t(), player.displayName);

    const embed = new EmbedBuilder()
      .description((t) => t("verification.successfulVerification", { displayName }))
      .color(STATUS_COLORS.success);

    return {
      embeds: [embed],
    };
  }

  private getVerifyGif(): InteractionAttachment {
    const buffer = readFileSync(getAssetPath("verify.gif"));
    return { name: "verify.gif", data: buffer };
  }
}
