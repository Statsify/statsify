/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiService, MojangApiService } from "#services";
import { Canvas } from "skia-canvas/lib";
import {
  Command,
  CommandContext,
  EmbedBuilder,
  MojangPlayerArgument,
} from "@statsify/discord";
import { INFO_COLOR } from "#constants";

@Command({ description: "commands.skin", args: [MojangPlayerArgument] })
export class SkinCommand {
  public constructor(
    private readonly apiService: ApiService,
    private readonly mojangApiService: MojangApiService
  ) {}

  public async run(context: CommandContext) {
    const user = context.getUser();

    const player = await this.mojangApiService.getPlayer(
      context.option<string>("player"),
      user
    );

    const skin = await this.apiService.getPlayerSkin(player.uuid);
    const canvas = new Canvas(skin.width, skin.height);
    canvas.getContext("2d").drawImage(skin, 0, 0);

    const embed = new EmbedBuilder()
      .field((t) => t("embeds.skin.description.username"), `\`${player.username}\``)
      .color(INFO_COLOR)
      .image(`attachment://skin.png`);

    return {
      embeds: [embed],
      files: [
        { data: await canvas.toBuffer("png"), name: "skin.png", type: "image/png" },
      ],
    };
  }
}
