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
  MemberService,
} from "@statsify/discord";
import { STATUS_COLORS } from "@statsify/logger";
import { config } from "@statsify/util";

const SUPPORT_BOT_GUILD_ID = config("supportBot.guild");
const SUPPORT_BOT_MEMBER_ROLE_ID = config("supportBot.memberRole");

@Command({ description: (t) => t("commands.unverify"), cooldown: 5 })
export class UnverifyCommand {
  public constructor(
    private readonly apiService: ApiService,
    private readonly memberService: MemberService
  ) {}

  public async run(context: CommandContext): Promise<IMessage> {
    const userId = context.getInteraction().getUserId();
    const user = context.getUser();

    if (!user?.uuid) throw new ErrorMessage("verification.notVerified");

    await this.apiService.unverifyUser(userId);

    await this.memberService
      .removeRole(SUPPORT_BOT_GUILD_ID, userId, SUPPORT_BOT_MEMBER_ROLE_ID)
      .then(() => this.apiService.updateUser(userId, { serverMember: false }))
      .catch(() => null);

    const embed = new EmbedBuilder()
      .description((t) => t("verification.successfulUnverification"))
      .color(STATUS_COLORS.success);

    return {
      embeds: [embed],
    };
  }
}

@Command({ description: (t) => t("commands.unverify"), cooldown: 5 })
export class UnlinkCommand extends UnverifyCommand {}
