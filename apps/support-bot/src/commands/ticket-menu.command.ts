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
  ContainerBuilder,
  IMessage,
  MessageService,
  TextDisplayBuilder,
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

    const button = new ButtonBuilder()
      .label("Create Ticket")
      .style(ButtonStyle.Primary)
      .customId("create-ticket");

    const container = new ContainerBuilder([
      new TextDisplayBuilder(
        `## Create Ticket\nClick the create ticket button below to open a support channel.\n\n__**Ticket Information**__\n${rules
          .map((r) => `\`•\` ${r}`)
          .join("\n")}`
      ),
      new ActionRowBuilder([button]),
    ]).accentColor(STATUS_COLORS.info);

    await this.messageService.send(await config("supportBot.createTicketChannel"), {
      components: [container],
    });

    return {
      content: "Ticket Message Sent",
      ephemeral: true,
    };
  }
}
