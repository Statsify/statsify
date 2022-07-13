/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Command, EmbedBuilder, IMessage } from "@statsify/discord";
import { STATUS_COLORS } from "@statsify/logger";
import { UserLogo } from "@statsify/schemas";
import { getLogoPath } from "@statsify/assets";
import { readFile } from "node:fs/promises";

@Command({ description: (t) => t("commands.help") })
export class HelpCommand {
  public async run(): Promise<IMessage> {
    const embed = new EmbedBuilder()
      .title((t) => t("embeds.help.title"))
      .description(
        (t) =>
          `Need Support? Join our ${t(
            "socials.discord"
          )} and create a ticket to directly contact us.`
      )
      .field(
        (t) => t("embeds.help.games.title"),
        (t) => t("embeds.help.games.description")
      )
      .field(
        (t) => t("embeds.help.leaderboards.title"),
        (t) => t("embeds.help.leaderboards.description")
      )
      .field(
        (t) => t("embeds.help.historical.title"),
        (t) => t("embeds.help.historical.description")
      )
      .field(
        (t) => t("embeds.help.minecraft.title"),
        (t) => t("embeds.help.minecraft.description")
      )
      .color(STATUS_COLORS.info)
      .thumbnail("attachment://logo.png");

    const logo = await readFile(getLogoPath(UserLogo.DEFAULT, 64));

    return {
      embeds: [embed],
      files: [{ name: "logo.png", data: logo, type: "image/png" }],
    };
  }
}
