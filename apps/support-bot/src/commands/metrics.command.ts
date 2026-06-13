/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiService, Command, EmbedBuilder, ErrorMessage } from "@statsify/discord";
import { STATUS_COLORS } from "@statsify/logger";
import { UserTier } from "@statsify/schemas";

@Command({
  description: (t) => t("commands.metrics"),
  tier: UserTier.CORE,
  userCommand: false,
})
export class MetricsCommand {
  public constructor(private readonly apiService: ApiService) {}

  public async run() {
    const metrics = await this.apiService.getActiveMetrics();

    if (!metrics) throw new ErrorMessage("errors.unknown");

    const { dau, wau, mau, stickiness } = metrics;
    const weeklyStickiness = mau ? wau / mau : 0;

    const embed = new EmbedBuilder()
      .title("Active User Metrics")
      .field("Daily Active Users", (t) => `\`${t(dau)}\``, true)
      .field("Weekly Active Users", (t) => `\`${t(wau)}\``, true)
      .field("Monthly Active Users", (t) => `\`${t(mau)}\``, true)
      .field(
        "Retention",
        (t) =>
          `\`•\` **DAU/MAU**: \`${t(Math.round(stickiness * 100))}%\`\n\`•\` **WAU/MAU**: \`${t(
            Math.round(weeklyStickiness * 100)
          )}%\``
      )
      .color(STATUS_COLORS.info);

    return { embeds: [embed] };
  }
}
