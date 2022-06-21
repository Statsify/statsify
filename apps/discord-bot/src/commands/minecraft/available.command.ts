/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Command, CommandContext, EmbedBuilder } from "@statsify/discord";
import { MojangApiService } from "#services";
import { MojangPlayerArgument } from "#arguments";

@Command({ description: "commands.available", args: [new MojangPlayerArgument(true)] })
export class AvailableCommand {
  public constructor(private readonly mojangApiService: MojangApiService) {}

  public async run(context: CommandContext) {
    const name = context.option<string>("player");

    const base = new EmbedBuilder().field(
      (t) => `${t("embeds.available.description.username")} [${name.length}/16]`,
      `\`${name}\``
    );

    const isInvalidLength = name.length > 16;
    const invalidName = !/^\w+$/i.test(name);

    if (isInvalidLength || invalidName) {
      base.color(0xb7_6b_a3).field(
        (t) => t("embeds.available.description.status"),
        (t) =>
          `\`${t(
            `embeds.available.description.${
              isInvalidLength ? "tooLong" : "invalidCharacters"
            }`
          )}\``
      );

      return { embeds: [base] };
    }

    const nameInfo = await this.mojangApiService.checkName(name.trim());

    if (!nameInfo) {
      base
        .field(
          (t) => t("embeds.available.description.namemc"),
          `[\`Here\`](https://namemc.com/profile/${name})`
        )
        .field(
          (t) => t("embeds.available.description.status"),
          (t) => `\`${t("available")}*\``
        )
        .footer((t) => `*${t("embeds.available.footer.available")}`)
        .color(0x00_a2_8a);
    } else {
      base
        .field(
          (t) => t("embeds.available.description.uuid"),
          `\`${nameInfo.uuid.replaceAll("-", "")}\``
        )
        .field(
          (t) => t("embeds.available.description.namemc"),
          `[\`Here\`](https://namemc.com/profile/${nameInfo.uuid.replaceAll("-", "")})`
        )
        .field(
          (t) => t("embeds.available.description.status"),
          (t) => `\`${t("unavailable")}\``
        )
        .color(0xf7_c4_6c)
        .thumbnail(this.mojangApiService.faceIconUrl(nameInfo.uuid));
    }

    return { embeds: [base] };
  }
}
