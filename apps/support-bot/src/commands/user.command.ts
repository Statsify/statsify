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
import { User, UserTheme, UserTier } from "@statsify/schemas";
import { prettify } from "@statsify/util";

@Command({
  description: (t) => t("commands.user"),
  args: [new UserArgument("user", false)],
  tier: UserTier.STAFF,
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

    this.addField(embed, "Has Badge", user.hasBadge);

    this.addField(
      embed,
      "tier",
      user.tier,
      (v) => `\`${prettify(User.getTierName(v))}\``
    );

    this.addField(embed, "Theme", prettify(user.theme ?? UserTheme.DEFAULT));

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
