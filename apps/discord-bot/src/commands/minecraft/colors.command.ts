/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Command, EmbedBuilder } from "@statsify/discord";
import { INFO_COLOR } from "#constants";
import { hexToRgb, mcShadow, rgbToHex } from "@statsify/rendering";
import { minecraftColors } from "@statsify/util";

@Command({ description: "commands.colors" })
export class ColorsCommand {
  public async run() {
    const embed = new EmbedBuilder()
      .title((t) => t("embeds.colors.title"))
      .description((t) => {
        let desc = `**${t("embeds.colors.description.color")} • ${t(
          "embeds.colors.description.mainHex"
        )} • ${t("embeds.colors.description.shadowHex")}**\n`;

        minecraftColors.forEach((color) => {
          desc += `${t(`emojis:colors.${[color.code.slice(1)]}`)} \`${color.code}\` • \`${
            color.hex
          }\` • \`${rgbToHex(mcShadow(hexToRgb(color.hex)))}\`\n`;
        });

        desc += "\n";
        desc += `${t("emojis:colors.k")} \`§k\` • ${t(
          "embeds.colors.description.obfuscated"
        )}\n`;
        desc += `${t("emojis:colors.l")} \`§l\` • **${t(
          "embeds.colors.description.bold"
        )}**\n`;
        desc += `${t("emojis:colors.m")} \`§m\` • ~~${t(
          "embeds.colors.description.strikethrough"
        )}~~\n`;
        desc += `${t("emojis:colors.n")} \`§n\` • _${t(
          "embeds.colors.description.underline"
        )}_\n`;
        desc += `${t("emojis:colors.o")} \`§o\` • *${t(
          "embeds.colors.description.italic"
        )}*\n`;
        desc += `${t("emojis:colors.r")} \`§r\` • ${t(
          "embeds.colors.description.reset"
        )}\n`;

        return desc;
      })
      .color(INFO_COLOR);

    return {
      embeds: [embed],
    };
  }
}
