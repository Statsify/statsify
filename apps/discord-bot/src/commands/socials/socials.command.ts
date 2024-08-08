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
  IMessage,
  PlayerArgument,
} from "@statsify/discord";
import { STATUS_COLORS } from "@statsify/logger";
import { minecraftHeadUrl } from "#lib/minecraft-head";

@Command({ description: (t) => t("commands.socials"), args: [PlayerArgument] })
export class SocialsCommand {
  public constructor(private readonly apiService: ApiService) {}

  public async run(context: CommandContext): Promise<IMessage> {
    const user = context.getUser();

    const { socials, uuid, displayName } = await this.apiService.getPlayer(
      context.option("player"),
      user
    );

    const embed = new EmbedBuilder()
      .title((t) => this.apiService.emojiDisplayName(t, displayName))
      .author("Player Socials")
      .thumbnail(minecraftHeadUrl(uuid))
      .color(STATUS_COLORS.info)
      .field(
        (t) => `${t("emojis:socials.embed.discord")} Discord`,
        this.formatSocial(socials.discord, false)
      )
      .field(
        (t) => `${t("emojis:socials.embed.forums")} Forums`,
        this.formatSocial(socials.forums)
      )
      .field(
        (t) => `${t("emojis:socials.embed.instagram")} Instagram`,
        this.formatSocial(socials.instagram)
      )
      .field(
        (t) => `${t("emojis:socials.embed.tiktok")} TikTok`,
        this.formatSocial(socials.tiktok)
      )
      .field(
        (t) => `${t("emojis:socials.embed.twitch")} Twitch`,
        this.formatSocial(socials.twitch)
      )
      .field(
        (t) => `${t("emojis:socials.embed.twitter")} X`,
        this.formatSocial(socials.twitter)
      )
      .field(
        (t) => `${t("emojis:socials.embed.youtube")} YouTube`,
        this.formatSocial(socials.youtube)
      );

    return { embeds: [embed] };
  }

  private formatSocial(social?: string, link = true) {
    if (!social) return "`N/A`";

    if (link) {
      social = social.startsWith("https://") ? social : `https://${social}`;
      return `[\`Here\`](${social})`;
    }

    return `\`${social}\``;
  }
}
