/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Command, EmbedBuilder, IMessage } from "@statsify/discord";
import { INFO_COLOR } from "#constants";
import { UserTier } from "@statsify/schemas";
import { config } from "@statsify/util";
import { getLogoPath } from "@statsify/assets";
import { readFile } from "node:fs/promises";

@Command({ description: (t) => t("commands.info") })
export class InviteCommand {
  public async run(): Promise<IMessage> {
    const embed = new EmbedBuilder()
      .title((t) => t("embeds.invite.title"))
      .color(INFO_COLOR)
      .description((t) => {
        const description = t("embeds.invite.description");

        const links = [
          `**${t("socials.invite", { id: config("discordBot.applicationId") })}**`,
          t("socials.discord"),
          t("socials.premium"),
          t("socials.website"),
          t("socials.github"),
          t("socials.forums"),
        ]
          .map((link) => `\`•\` ${link}`)
          .join("\n");

        return `${description}\n\n${links}`;
      })
      .thumbnail("attachment://logo.png");

    const logo = await readFile(getLogoPath(UserTier.NONE, 64));

    return {
      embeds: [embed],
      files: [{ name: "logo.png", data: logo, type: "image/png" }],
    };
  }
}
