/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  ApiService,
  ButtonBuilder,
  Command,
  CommandContext,
  ContainerBuilder,
  IMessage,
  type LocalizeFunction,
  PlayerArgument,
  SectionBuilder,
  SeparatorBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
} from "@statsify/discord";
import { ButtonStyle } from "discord-api-types/v10";
import { STATUS_COLORS } from "@statsify/logger";
import { minecraftHeadAttachment } from "#lib/minecraft-head";

const SOCIALS = [
  ["forums", "Forums"],
  ["instagram", "Instagram"],
  ["tiktok", "TikTok"],
  ["twitch", "Twitch"],
  ["twitter", "X"],
  ["youtube", "YouTube"],
] as const;

const MAX_BUTTON_URL_LENGTH = 512;

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
    const discord = formatHandle(socials.discord);

    const container = new ContainerBuilder([
      new SectionBuilder(
        [
          (t) => `-# ${t("embeds.socials.title")}\n## ${this.apiService.emojiDisplayName(t, displayName)}`,
          (t) => `${t("emojis:socials.discord")} Discord ${discord ? `\`${discord}\`` : t("embeds.socials.notLinked")}`,
        ],
        new ThumbnailBuilder(`attachment://${head.name}`)
      ),
      new SeparatorBuilder(),
    ]).accentColor(STATUS_COLORS.info);

    const unlinked: string[] = [];

    for (const [key, name] of SOCIALS) {
      const handle = formatHandle(socials[key]);

      if (!handle) {
        unlinked.push(name);
        continue;
      }

      const text = (t: LocalizeFunction) => `${t(`emojis:socials.${key}`)} **${name}**\n-# \`${handle}\``;
      const url = parseSocialLink(handle);

      if (url && url.length <= MAX_BUTTON_URL_LENGTH) {
        const button = new ButtonBuilder()
          .label((t) => t("embeds.socials.open"))
          .style(ButtonStyle.Link)
          .url(url);

        container.component(new SectionBuilder([text], button));
      } else {
        container.component(new TextDisplayBuilder(text));
      }
    }

    if (unlinked.length > 0)
      container.component(
        new TextDisplayBuilder((t) => `-# ${t("embeds.socials.notLinkedList", { socials: unlinked.join(", ") })}`)
      );

    return { components: [container], files: [head] };
  }
}

function formatHandle(social?: string) {
  return social?.replaceAll("`", "").trim();
}

/**
 * A player can input a social link without a scheme, so this returns the link with http(s)
 */
function parseSocialLink(social: string) {
  const hasScheme = /^[a-z][\d+.a-z-]*:\/\//i.test(social);
  const url = URL.parse(hasScheme ? social : `https://${social}`);

  if (!url || (url.protocol !== "http:" && url.protocol !== "https:")) return;

  return url.href;
}
