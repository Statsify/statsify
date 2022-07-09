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
  Page,
  PaginateService,
} from "@statsify/discord";
import { FormattedGame, GameId, GamePlayers } from "@statsify/schemas";
import { STATUS_COLORS } from "@statsify/logger";
import { mapGame } from "#constants";
import { removeFormatting } from "@statsify/util";

@Command({
  description: (t) => t("commands.gameCounts"),
})
export class GameCountsCommand {
  public constructor(
    private readonly apiService: ApiService,
    private readonly paginateService: PaginateService
  ) {}

  public async run(context: CommandContext) {
    const t = context.t();
    const gamecounts = await this.apiService.getGamecounts();

    const gamecountEntries = Object.entries(gamecounts) as [GameId, GamePlayers][];

    const subGameGenerators = gamecountEntries
      .filter(([, g]) => g.modes && Object.keys(g.modes).length > 1)
      .map(([id, { players, modes }]) => {
        const name = removeFormatting(FormattedGame[id]);
        const list = Object.entries(modes!).sort((a, b) => Number(b[1]) - Number(a[1]));

        const embed = new EmbedBuilder()
          .title((t) => `${name} ${t("players")}`)
          .color(STATUS_COLORS.info)
          .description(
            (t) =>
              `${this.formatGameCount(t("stats.total"), t(players))}\n\n${list
                .map(([mode, players]) =>
                  this.formatGameCount(mapGame(id, mode), t(players))
                )
                .join("\n")}`
          );

        return {
          label: name,
          emoji: t(`emojis:games.${id}`),
          generator: () => embed,
        };
      });

    const total = gamecountEntries.reduce((acc, [, v]) => acc + (v.players ?? 0), 0);

    const list = gamecountEntries
      .sort((a, b) => b[1].players - a[1].players)
      .map(([id, { players }]) =>
        this.formatGameCount(
          removeFormatting(FormattedGame[id]),
          t(players),
          t(`emojis:games.${id}`)
        )
      )
      .join("\n");

    const overall = new EmbedBuilder()
      .title((t) => t("embeds.gameCounts.title"))
      .color(STATUS_COLORS.info)
      .description(
        (t) => `${this.formatGameCount(t("stats.total"), t(total))}\n\n${list}`
      );

    const pages: Page[] = [
      {
        label: "Overall",
        generator: () => overall,
      },
      ...subGameGenerators,
    ];

    return this.paginateService.paginate(context, pages);
  }

  private formatGameCount(name: string, count: string, emoji?: string) {
    return `\`•\` ${emoji ? `${emoji} ` : ""}**${name}**: \`${count || 0}\``;
  }
}
