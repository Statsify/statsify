/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { minecraftHeadUrl } from "#lib/minecraft-head";
import {
  ApiService,
  Command,
  CommandContext,
  EmbedBuilder,
  MojangPlayerArgument,
} from "@statsify/discord";
import { STATUS_COLORS } from "@statsify/logger";

@Command({ description: (t) => t("commands.uuid"), args: [new MojangPlayerArgument()] })
export class UUIDCommand {
  public constructor(private readonly apiService: ApiService) {}

  public async run(context: CommandContext) {
    const user = context.getUser();

    const player = await this.apiService.getPlayerSkinTextures(
      context.option<string>("player"),
      user
    );

    const thumbURL = minecraftHeadUrl(player.uuid);

    const embed = new EmbedBuilder()
      .field((t) => t("minecraft.username"), `\`${player.username}\``)
      .field((t) => t("minecraft.uuid"), `\`${player.uuid}\``)
      .field((t) => t("minecraft.trimmedUUID"), `\`${player.uuid.replaceAll("-", "")}\``)
      .color(STATUS_COLORS.info)
      .thumbnail(thumbURL);

    return { embeds: [embed] };
  }
}
