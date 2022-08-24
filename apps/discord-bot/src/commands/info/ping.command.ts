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
    [":flag_cn:", "中文", ["LOSTED#8754", "! Tina<3.#4856", "wateTina#1399"]],
    [":flag_tw:", "繁體中文", ["LOSTED#8754", "Summer_Albert#6666", "wateTina#1399"]],
    [":flag_cz:", "Čeština", ["DavidCzPdy#7401", "Farmans#2226"]],
    [":flag_nl:", "Nederlands", ["The Almighty One#3365", "Twen#8000"]],
    [":flag_fi:", "Suomi", ["Diyn#0420", "IDA#9999"]],
    [":flag_fr:", "Français", ["o3w#0095", "Pineapple#3046", "Skorlex#2962"]],
    [":flag_de:", "Deutsch", ["FaSa#4264", "mxny#4860", "pekk#6507"]],
    [":flag_gr:", "Ελληνικά", ["Pauldopa#0666", "Thrilly#4361"]],
    [":flag_hu:", "Magyar", ["mustangk#1911", "royys#6623"]],
    [":flag_it:", "Italiano", ["ItsMassiGaming#4041", "Lorylol#5838"]],
    [":flag_no:", "Norsk", ["SiljeC#7027", "maiu#0010"]],
    [":flag_pl:", "Polski", ["Down#1111"]],
    [":flag_br:", "Português do Brasil", ["dainel#0413", "kane#3078", "eyz#0616"]],
    [":flag_ro:", "Română", ["prebowed#3392"]],
    [":flag_ru:", "Pусский", ["! Proofreader#3204", "unies#0001"]],
    [":flag_es:", "Español", ["cubic#0028", "Wxlter#7907"]],
    [":flag_se:", "Svenska", ["loTen <orangerose>#4104", "IDA#9999"]],
    [":flag_tr:", "Türkçe", ["Melongan#8305"]],
    [":flag_th:", "ไทย", ["Zack#0420"]],
    [":flag_vn:", "Tiếng Việt", ["ytui8#1818"]],
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
          "`jacob#5432`, `Codr#0002`, `Mo2men#2806`, `connor#5957`",
          "",
          `__**${t("embeds.ping.contributors")}**__`,
          "`vnmm#6969`",
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
