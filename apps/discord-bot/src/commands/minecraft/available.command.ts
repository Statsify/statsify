/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  ApiService,
  Command,
  CommandContext,
  EmbedBuilder,
  MojangPlayerArgument,
} from "@statsify/discord";
import { minecraftHeadUrl } from "#lib/minecraft-head";

@Command({
  description: (t) => t("commands.available"),
  args: [new MojangPlayerArgument(true)],
})
export class AvailableCommand {
  public constructor(private readonly apiService: ApiService) {}

  public async run(context: CommandContext) {
    const name = context.option<string>("player");

    const base = new EmbedBuilder().field(
      (t) => `${t("minecraft.username")} [${name.length}/16]`,
      `\`${name}\``
    );

    const isInvalidLength = name.length > 16;
    const invalidName = !/^\w+$/i.test(name);

    if (isInvalidLength || invalidName) {
      base.color(0xb7_6b_a3).field(
        (t) => t("stats.status"),
        (t) =>
          `\`${t(
            `embeds.available.${isInvalidLength ? "tooLong" : "invalidCharacters"}`
          )}\``
      );

      return { embeds: [base] };
    }

    const uuid = await this.apiService.getPlayerSkinTextures(name.trim())
      .then(player => player.uuid.replaceAll("-", ""))
      .catch(() => undefined);

    if (uuid) {
      base
        .field((t) => t("minecraft.uuid"), `\`${uuid}\``)
        .field(
          "NameMC",
          `[\`Here\`](https://namemc.com/profile/${uuid})`
        )
        .field(
          (t) => t("stats.status"),
          (t) => `\`${t("minecraft.unavailable")}\``
        )
        .color(0xf7_c4_6c)
        .thumbnail(minecraftHeadUrl(uuid));
    } else {
      base
        .field("NameMC", `[\`Here\`](https://namemc.com/profile/${name})`)
        .field(
          (t) => t("stats.status"),
          (t) => `\`${t("minecraft.available")}*\``
        )
        .footer((t) => `*${t("embeds.available.blocked")}`)
        .color(0x00_a2_8a);
    }

    return { embeds: [base] };
  }
}
