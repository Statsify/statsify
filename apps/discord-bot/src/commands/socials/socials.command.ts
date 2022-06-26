/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiService, MojangApiService } from "#services";
import {
  Command,
  CommandContext,
  EmbedBuilder,
  IMessage,
  PlayerArgument,
} from "@statsify/discord";
import { INFO_COLOR } from "#constants";

@Command({ description: (t) => t("commands.socials"), args: [PlayerArgument] })
export class SocialsCommand {
  public constructor(
    private readonly apiService: ApiService,
    private readonly mojangApiService: MojangApiService
  ) {}

  public async run(context: CommandContext): Promise<IMessage> {
    const user = context.getUser();

    const { socials, uuid, displayName } = await this.apiService.getPlayer(
      context.option("player"),
      user
    );

    const embed = new EmbedBuilder()
      .title((t) => this.apiService.emojiDisplayName(t, displayName))
      .author("Player Socials")
      .thumbnail(this.mojangApiService.faceIconUrl(uuid))
      .color(INFO_COLOR)
      .field(
        (t) => `${t("emojis:socials.discord")} Discord`,
        this.formatSocial(socials.discord, false)
      )
      .field(
        (t) => `${t("emojis:socials.forums")} Forums`,
        this.formatSocial(socials.forums)
      )
      .field(
        (t) => `${t("emojis:socials.instagram")} Instagram`,
        this.formatSocial(socials.instagram)
      )
      .field(
        (t) => `${t("emojis:socials.twitch")} Twitch`,
        this.formatSocial(socials.twitch)
      )
      .field(
        (t) => `${t("emojis:socials.twitter")} Twitter`,
        this.formatSocial(socials.twitter)
      )
      .field(
        (t) => `${t("emojis:socials.youtube")} YouTube`,
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
