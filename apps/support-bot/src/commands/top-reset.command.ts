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
  ErrorMessage,
  PaginateService,
} from "@statsify/discord";
import { DateTime } from "luxon";
import { STATUS_COLORS } from "@statsify/logger";
import { UserTier } from "@statsify/schemas";
import { arrayGroup } from "@statsify/util";

const TIMES_PER_PAGE = 25;

@Command({
  description: (t) => t("commands.top-reset"),
  tier: UserTier.CORE,
})
export class TopResetCommand {
  public constructor(
    private readonly apiService: ApiService,
    private readonly paginateService: PaginateService
  ) {}

  public async run(context: CommandContext) {
    const resetTimes = await this.apiService.getHistoricalTimes();

    if (!resetTimes) throw new ErrorMessage("errors.unknown");

    const timeList = Object.entries(resetTimes).sort((a, b) => b[1] - a[1]);
    const groups = arrayGroup(timeList, TIMES_PER_PAGE);

    return this.paginateService.scrollingPagination(
      context,
      groups.map(
        (group, index) => () =>
          this.createTopPage(
            index,
            group,
            timeList.reduce((acc, curr) => acc + +curr[1], 0)
          )
      )
    );
  }

  private createTopPage(
    page: number,
    times: [minute: string, count: number][],
    totalPlayers: number
  ) {
    const now = DateTime.now();

    const embed = new EmbedBuilder()
      .title("Historical Reset Times")
      .footer((t) => `Historical Players: ${t(totalPlayers)}`)
      .color(STATUS_COLORS.info)
      .description((t) =>
        times
          .map(([minute, count], index) => {
            const position = page * TIMES_PER_PAGE + index + 1;

            const resetTime = now
              .minus({ hours: now.hour, minutes: now.minute })
              .plus({ minutes: +minute });

            return `\`#${String(position).padStart(
              String(page * TIMES_PER_PAGE + TIMES_PER_PAGE).length,
              "0"
            )}\` <t:${Math.round(resetTime.toMillis() / 1000)}:t>: **${t(count)}**`;
          })
          .join("\n")
      );

    return embed;
  }
}
