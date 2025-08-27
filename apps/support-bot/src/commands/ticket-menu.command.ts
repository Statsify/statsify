/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  ActionRowBuilder,
  ButtonBuilder,
  Command,
  EmbedBuilder,
  IMessage,
  MessageService,
} from "@statsify/discord";
import { ButtonStyle } from "discord-api-types/v10";
import { STATUS_COLORS } from "@statsify/logger";
import { UserTier } from "@statsify/schemas";
import { config } from "@statsify/util";

@Command({ description: (t) => t("commands.ticket-menu"), tier: UserTier.CORE, userCommand: false })
export class TicketMenuCommand {
  public constructor(private readonly messageService: MessageService) {}

  public async run(): Promise<IMessage> {
    const rules = [
      "Support is in **English only**, please use a translator if necessary.",
      "Abuse of the ticket system will lead to **punishment(s)**",
    ];

    const embed = new EmbedBuilder()
      .title("Create Ticket")
      .color(STATUS_COLORS.info)
      .description(
        `Click the create ticket button below to open a support channel.\n\n__**Ticket Information**__\n${rules
          .map((r) => `\`•\` ${r}`)
          .join("\n")}`
      );

    const button = new ButtonBuilder()
      .label("Create Ticket")
      .style(ButtonStyle.Primary)
      .customId("create-ticket");

    await this.messageService.send(await config("supportBot.createTicketChannel"), {
      embeds: [embed],
      components: [new ActionRowBuilder().component(button)],
    });

    return {
      content: "Ticket Message Sent",
      ephemeral: true,
    };
  }
}
