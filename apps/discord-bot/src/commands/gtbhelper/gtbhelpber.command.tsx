/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Command, CommandContext, EmbedBuilder, ErrorMessage } from "@statsify/discord";
import { GTBHelperArgument } from "./gtbhelper.argument.js";
import { STATUS_COLORS } from "@statsify/logger";
import { arrayGroup } from "@statsify/util";
import { findSolutions } from "./find-solutions.js";

@Command({ description: (t) => t("commands.gtbhelper"), args: [GTBHelperArgument] })
export class GTBHelperCommand {
  public run(context: CommandContext) {
    const hint = context.option<string>("hint");
    const words = findSolutions(hint);

    if (!words.length) {
      throw new ErrorMessage(
        (t) => t("errors.noGTBSolutions.title"),
        (t) => t("errors.noGTBSolutions.description")
      );
    }

    const embed = new EmbedBuilder()
      .title((t) => t("embeds.gtbhelper.title"))
      .color(STATUS_COLORS.info);

    const groups = arrayGroup(words, Math.ceil(words.length / 3));

    groups.forEach((solutions) =>
      embed.field("\u200b", solutions.map((s) => `\`•\` ${s}`).join("\n"), true)
    );

    return { embeds: [embed] };
  }
}
