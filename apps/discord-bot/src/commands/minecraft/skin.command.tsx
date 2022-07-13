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
  IMessage,
  MojangPlayerArgument,
} from "@statsify/discord";
import { Canvas } from "skia-canvas";
import { MojangApiService } from "#services";
import { STATUS_COLORS } from "@statsify/logger";

@Command({ description: "commands.skin", args: [MojangPlayerArgument] })
export class SkinCommand {
  public constructor(
    private readonly apiService: ApiService,
    private readonly mojangApiService: MojangApiService
  ) {}

  public async run(context: CommandContext): Promise<IMessage> {
    const user = context.getUser();

    const player = await this.mojangApiService.getPlayer(
      context.option<string>("player"),
      user
    );

    const skin = await this.apiService.getPlayerSkin(player.uuid);
    const canvas = new Canvas(skin.width, skin.height);
    canvas.getContext("2d").drawImage(skin, 0, 0);

    const embed = new EmbedBuilder()
      .field((t) => t("minecraft.username"), `\`${player.username}\``)
      .color(STATUS_COLORS.info)
      .image(`attachment://skin.png`);

    const buffer = await canvas.toBuffer("png");

    return {
      embeds: [embed],
      files: [{ data: buffer, name: "skin.png", type: "image/png" }],
    };
  }
}
