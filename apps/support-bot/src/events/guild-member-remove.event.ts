/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AbstractEventListener } from "@statsify/discord";
import {
  GatewayDispatchEvents,
  GatewayGuildMemberRemoveDispatchData,
} from "discord-api-types/v10";
import { Service } from "typedi";
import { TicketService } from "#services";
import { env } from "@statsify/util";

@Service()
export class GuildMemberRemoveEventListener extends AbstractEventListener<GatewayDispatchEvents.GuildMemberRemove> {
  public event = GatewayDispatchEvents.GuildMemberRemove as const;

  public constructor(private readonly ticketService: TicketService) {
    super();
  }

  public async onEvent(data: GatewayGuildMemberRemoveDispatchData): Promise<void> {
    const guildId = data.guild_id;
    if (guildId !== env("SUPPORT_BOT_GUILD")) return;

    const memberId = data.user.id;

    await this.ticketService.close(
      memberId,
      "user",
      env("SUPPORT_BOT_APPLICATION_ID"),
      "Member left"
    );
  }
}
