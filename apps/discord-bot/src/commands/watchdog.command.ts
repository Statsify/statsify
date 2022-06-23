/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiService } from "#services";
import { Command, EmbedBuilder } from "@statsify/discord";
import { INFO_COLOR } from "#constants";

@Command({
  description: (t) => t("commands.watchdog"),
})
export class WatchdogCommand {
  public constructor(private readonly apiService: ApiService) {}

  public async run() {
    const watchdog = await this.apiService.getWatchdog();

    const embed = new EmbedBuilder()
      .title("Watchdog Ban Stats")
      .field(
        "Overall",
        (t) =>
          `\`•\` **Lifetime**: \`${t(watchdog.overall.bans)}\`\n\`•\` **Last Day**: \`${t(
            watchdog.overall.lastDay
          )}\``
      )
      .field(
        "Watchdog",
        (t) =>
          `\`•\` **Lifetime**: \`${t(
            watchdog.watchdog.bans
          )}\`\n\`•\` **Last Day**: \`${t(
            watchdog.watchdog.lastDay
          )}\`\n\`•\` **Last Minute**: \`${t(watchdog.watchdog.lastMinute)}\``
      )
      .field(
        "Staff",
        (t) =>
          `\`•\` **Lifetime**: \`${t(watchdog.staff.bans)}\`\n\`•\` **Last Day**: \`${t(
            watchdog.staff.lastDay
          )}\``
      )
      .color(INFO_COLOR);

    return {
      embeds: [embed],
    };
  }
}
