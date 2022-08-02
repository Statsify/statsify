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

@Command({ description: (t) => t("commands.ping") })
export class PingCommand {
  public async run(): Promise<IMessage> {
    const embed = new EmbedBuilder()
      .title((t) => t("embeds.ping.title"))
      .field(
        (t) => t("embeds.ping.core"),
        "`jacob#5432`, `Codr#0002`, `Mo2men#2806`, `connor#5957`"
      )
      .field((t) => t("embeds.ping.contributors"), "`vnmm#6969`")
      .field(
        (t) => t("embeds.ping.translators"),
        ":flag_nl: `The Almighty One#3365`, :flag_fr: `Pineapple#3046`, :flag_cn: `wateTina#1399`"
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
