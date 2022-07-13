/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  Command,
  CommandContext,
  EmbedBuilder,
  MojangPlayerArgument,
  PaginateService,
} from "@statsify/discord";
import { MojangApiService } from "#services";
import { STATUS_COLORS } from "@statsify/logger";
import { arrayGroup } from "@statsify/util";

@Command({ description: "commands.namehistory", args: [MojangPlayerArgument] })
export class NameHistoryCommand {
  public constructor(
    private readonly mojangApiService: MojangApiService,
    private readonly paginateService: PaginateService
  ) {}

  public async run(context: CommandContext) {
    const user = context.getUser();

    const player = await this.mojangApiService.getPlayer(
      context.option<string>("player"),
      user
    );

    const thumbURL = this.mojangApiService.faceIconUrl(player.uuid);
    const nameHistory = player.username_history.reverse();

    const groupSize = 25;

    const name = `${player.username}${player.username.slice(-1) == "s'" ? "'" : "'s"}`;

    const groups = arrayGroup(nameHistory, groupSize);

    return this.paginateService.scrollingPagination(
      context,
      groups.map(
        (history, index) => () =>
          new EmbedBuilder()
            .title((t) =>
              t(`${name} ${t("minecraft.nameHistory")} [${nameHistory.length}]`)
            )
            .description((t) =>
              history
                .map(({ username, changed_at }) => {
                  const time = changed_at
                    ? `<t:${Math.floor(new Date(changed_at).getTime() / 1000)}:R>`
                    : `\`${t("minecraft.originalName")}\``;

                  return `\`•\` **${username}**: ${time}\n`;
                })
                .join("")
            )
            .footer(
              `Page ${index + 1}/${groups.length} • Viewing ${index * groupSize + 1}-${
                index * groupSize + history.length
              }`
            )
            .url(`https://namemc.com/profile/${player.uuid}`)
            .color(STATUS_COLORS.info)
            .thumbnail(thumbURL)
      )
    );
  }
}
