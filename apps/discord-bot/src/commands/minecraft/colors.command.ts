/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Command, EmbedBuilder } from "@statsify/discord";
import { STATUS_COLORS } from "@statsify/logger";
import { mcShadow } from "@statsify/rendering";
import { minecraftColors } from "@statsify/util";

@Command({ description: (t) => t("commands.colors") })
export class ColorsCommand {
  public async run() {
    const embed = new EmbedBuilder()
      .title((t) => t("embeds.colors.title"))
      .description((t) => {
        let desc = `**${t("embeds.colors.color")} • ${t("embeds.colors.mainHex")} • ${t(
          "embeds.colors.shadowHex"
        )}**\n`;

        minecraftColors.forEach((color) => {
          desc += `${t(`emojis:colors.${[color.code.slice(1)]}`)} \`${color.code}\` • \`${
            color.hex
          }\` • \`${mcShadow(color.hex)}\`\n`;
        });

        desc += "\n";
        desc += `${t("emojis:colors.k")} \`§k\` • ${t("embeds.colors.obfuscated")}\n`;
        desc += `${t("emojis:colors.l")} \`§l\` • **${t("embeds.colors.bold")}**\n`;
        desc += `${t("emojis:colors.m")} \`§m\` • ~~${t(
          "embeds.colors.strikethrough"
        )}~~\n`;
        desc += `${t("emojis:colors.n")} \`§n\` • _${t("embeds.colors.underline")}_\n`;
        desc += `${t("emojis:colors.o")} \`§o\` • *${t("embeds.colors.italic")}*\n`;
        desc += `${t("emojis:colors.r")} \`§r\` • ${t("embeds.colors.reset")}\n`;

        return desc;
      })
      .color(STATUS_COLORS.info);

    return {
      embeds: [embed],
    };
  }
}
