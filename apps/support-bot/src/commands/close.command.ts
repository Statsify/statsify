/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Command, CommandContext, ErrorMessage, TextArgument } from "@statsify/discord";
import { TicketService } from "#services";

@Command({
  description: (t) => t("commands.close"),
  args: [new TextArgument("reason", (t) => t("arguments.reason"), false)],
  userCommand: false,
})
export class CloseCommand {
  public constructor(private readonly ticketService: TicketService) {}

  public async run(context: CommandContext) {
    const interaction = context.getInteraction();

    const deleted = await this.ticketService.close(
      interaction.getChannelId()!,
      "channel",
      interaction.getUserId(),
      context.option<string>("reason")
    );

    if (!deleted) throw new ErrorMessage("errors.invalidTicketChannel");
  }
}
