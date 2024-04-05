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

const TRANSLATORS = (
  [
    [":flag_cn:", "中文", ["@losted69", "@tinalovesyou", "@watetina"]],
    [":flag_tw:", "繁體中文", ["@losted69", "@summer_albert", "@watetina"]],
    [":flag_cz:", "Čeština", ["@davidczpdy", "@farmans"]],
    [":flag_nl:", "Nederlands", ["@mauritswilke", "@kinderfeest"]],
    [":flag_fi:", "Suomi", ["@diyn", "@idakoi"]],
    [":flag_fr:", "Français", ["@o3w", "@pineapples._.", "@skorlex", "@volcanofr"]],
    [":flag_de:", "Deutsch", ["@fasa.", "@mxny69", "@pekk."]],
    [":flag_gr:", "Ελληνικά", ["@pauldopa", "@thrilly"]],
    [":flag_hu:", "Magyar", ["@mustangk", "@royys"]],
    [":flag_it:", "Italiano", ["@itsmassigaming", "@lorylol"]],
    [":flag_jp:", "日本語", ["@2zack", "@googlefan"]],
    [":flag_kr:", "한국어", ["@mirnyang"]],
    [":flag_no:", "Norsk", ["@Fyttikatta", "@astrasis"]],
    [":flag_pl:", "Polski", ["@downie.", "@metriusz"]],
    [":flag_br:", "Português do Brasil", ["@dainel", "@kaneboss"]],
    [":flag_ro:", "Română", ["@prebow", "@xitharis"]],
    [":flag_ru:", "Pусский", ["@proofreader", "@alissanah"]],
    [":flag_es:", "Español", ["@glacitee", "@_.walter"]],
    [":flag_se:", "Svenska", ["@lottend", "@idakoi"]],
    [":flag_tr:", "Türkçe", ["@melongan"]],
    [":flag_th:", "ไทย", ["@2zack"]],
    [":flag_ua:", "Українська", ["@typefast", "@pineapples._.", "@sergo_play"]],
    [":flag_vn:", "Tiếng Việt", ["@ytui8"]],
    [":flag_in:", "हिन्दी", ["@rutetid"]],
  ] as [flag: string, language: string, translators: string[]][]
)
  .sort(([, a], [, b]) => a.localeCompare(b))
  .map(([flag, lang, tr]) => `${flag} ${lang}: ${tr.map((t) => `\`${t}\``).join(", ")}`)
  .join("\n");

@Command({ description: (t) => t("commands.ping") })
export class PingCommand {
  public async run(): Promise<IMessage> {
    const embed = new EmbedBuilder()
      .title((t) => t("embeds.ping.title"))
      .description((t) =>
        [
          `__**${t("embeds.ping.core")}**__`,
          "`@jacobkoshy`, `@codr`, `@mo2men`, `@imconnorngl`",
          "",
          `__**${t("embeds.ping.contributors")}**__`,
          "`@vnmm`",
          "",
          `__**${t("embeds.ping.translators")}**__`,
          TRANSLATORS,
        ].join("\n")
      )
      .color(STATUS_COLORS.info)
      .thumbnail("attachment://logo.png");

    const logo = await readFile(getLogoPath(UserLogo.DEFAULT, 64));

    return {
      content: (t) => t("embeds.ping.pong"),
      embeds: [embed],
      files: [{ name: "logo.png", data: logo, type: "image/png" }],
    };
  }
}
