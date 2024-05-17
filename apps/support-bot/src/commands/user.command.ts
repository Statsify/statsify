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
  UserArgument,
} from "@statsify/discord";
import { STATUS_COLORS } from "@statsify/logger";
import { User, UserLogo, UserTier } from "@statsify/schemas";
import { prettify } from "@statsify/util";

@Command({
  description: (t) => t("commands.user"),
  args: [new UserArgument("user", false)],
  tier: UserTier.STAFF,
  userCommand: false,
})
export class UserCommand {
  public constructor(private readonly apiService: ApiService) {}

  public async run(context: CommandContext) {
    const [user, userId] = await this.getUser(context);

    if (!user)
      throw new ErrorMessage(
        (t) => t("errors.missingMentionVerification.title"),
        (t) => t("errors.missingMentionVerification.description", { tag: userId })
      );

    const embed = new EmbedBuilder().title("User").color(STATUS_COLORS.info);

    this.addField(embed, "Id", user.id);
    this.addField(embed, "UUID", user.uuid);

    this.addField(
      embed,
      "Verified",
      user.verifiedAt,
      (v) => `<t:${Math.round(v / 1000)}:R>`
    );

    this.addField(
      embed,
      "Unverified",
      user.unverifiedAt,
      (v) => `<t:${Math.round(v / 1000)}:R>`
    );

    this.addField(embed, "Server Member", user.serverMember);

    this.addField(embed, "Has Badge", user.hasBadge);

    this.addField(embed, "Tier", user.tier, (v) => `\`${User.getTierName(v)}\``);

    this.addField(embed, "Font", user.theme?.font, (v) => `\`${prettify(v)}\``);
    this.addField(embed, "Boxes", user.theme?.boxes, (v) => `\`${prettify(v)}\``);
    this.addField(embed, "Palette", user.theme?.palette, (v) => `\`${prettify(v)}\``);
    this.addField(embed, "Footer Message", user.footer?.message);

    const logos = Object.entries(UserLogo);

    this.addField(
      embed,
      "Footer Icon",
      user.footer?.icon,
      (v) => `\`${prettify(logos.find(([, l]) => l === v)?.[0] ?? "DEFAULT")}\``
    );

    return { embeds: [embed] };
  }

  private async getUser(
    context: CommandContext
  ): Promise<[user: User | null, userId: string]> {
    const userId = context.option<string | undefined>("user");

    if (!userId) return [context.getUser(), context.getInteraction().getUserId()];

    return [await this.apiService.getUser(userId), userId];
  }

  private addField<T>(
    embed: EmbedBuilder,
    title: string,
    value: T,
    fmt: (value: T extends undefined ? never : T) => string = (v) => `\`${v}\``
  ) {
    if (value === undefined) return;

    embed.field(title, fmt(value as any));
  }
}
