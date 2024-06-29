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
import { STATUS_COLORS } from "@statsify/logger";
import { minecraftHeadUrl } from "#lib/minecraft-head";

@Command({ description: (t) => t("commands.uuid"), args: [new MojangPlayerArgument()] })
export class UUIDCommand {
  public constructor(private readonly apiService: ApiService) {}

  public async run(context: CommandContext) {
    const user = context.getUser();

    const { username, uuid } = await this.apiService.getPlayerSkinTextures(
      context.option<string>("player"),
      user
    );

    const dashedUuid = `${uuid.slice(0, 8)}-${uuid.slice(8, 12)}-${uuid.slice(12, 16)}-${uuid.slice(16, 20)}-${uuid.slice(20)}`;
    
    const embed = new EmbedBuilder()
      .field((t) => t("minecraft.username"), `\`${username}\``)
      .field((t) => t("minecraft.uuid"), `\`${dashedUuid}\``)
      .field((t) => t("minecraft.trimmedUUID"), `\`${uuid}\``)
      .color(STATUS_COLORS.info)
      .thumbnail(minecraftHeadUrl(uuid));

    return { embeds: [embed] };
  }
}
