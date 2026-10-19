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
import { minecraftHeadAttachment } from "#lib/minecraft-head";

@Command({ description: (t) => t("commands.socials"), args: [PlayerArgument] })
export class SocialsCommand {
  public constructor(private readonly apiService: ApiService) {}

  public async run(context: CommandContext): Promise<IMessage> {
    const user = context.getUser();

    const { socials, uuid, displayName } = await this.apiService.getPlayer(
      context.option("player"),
      user
    );

    const head = await minecraftHeadAttachment(this.apiService, uuid);

    const embed = new EmbedBuilder()
      .title((t) => this.apiService.emojiDisplayName(t, displayName))
      .author("Player Socials")
      .thumbnail(`attachment://${head.name}`)
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

    return { embeds: [embed], files: [head] };
  }

  private formatSocial(social?: string, link = true) {
    const url = link && social ? parseSocialLink(social) : undefined;
    if (url) return `[\`Here\`](${url})`;

    // Backticks can't be escaped inside a code span, and current Discord usernames can't contain them
    const text = social?.replaceAll("`", "").trim();
    return `\`${text || "N/A"}\``;
  }
}

/**
 * Hypixel stores social links as the player typed them, with or without a scheme.
 * Returns the link as an http(s) URL that can't break out of a Markdown link.
 */
function parseSocialLink(social: string) {
  const value = social.trim();
  const hasScheme = /^[a-z][\d+.a-z-]*:\/\//i.test(value);
  const url = URL.parse(hasScheme ? value : `https://${value}`);

  if (!url || (url.protocol !== "http:" && url.protocol !== "https:")) return;

  // Parentheses would end the Markdown link early, and a backslash would escape the next character
  return url.href.replaceAll("(", "%28").replaceAll(")", "%29").replaceAll("\\", "%5C");
}
