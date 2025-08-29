/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AbstractEventListener, ApiService } from "@statsify/discord";
import {
  GatewayDispatchEvents,
  GatewayGuildMemberRemoveDispatchData,
} from "discord-api-types/v10";
import { Service } from "typedi";
import { TicketService, UserService } from "#services";
import { config } from "@statsify/util";

const GUILD_ID = await config("supportBot.guild");

@Service()
export class GuildMemberRemoveEventListener extends AbstractEventListener<GatewayDispatchEvents.GuildMemberRemove> {
  public event = GatewayDispatchEvents.GuildMemberRemove as const;

  public constructor(
    private readonly ticketService: TicketService,
    private readonly apiService: ApiService,
    private readonly userService: UserService
  ) {
    super();
  }

  public async onEvent(data: GatewayGuildMemberRemoveDispatchData): Promise<void> {
    const guildId = data.guild_id;
    if (guildId !== GUILD_ID) return;

    const memberId = data.user.id;

    await Promise.all([
      this.apiService.updateUser(memberId, { serverMember: false }),
      this.userService.removeAllPremium(memberId),
      this.ticketService.close(
        memberId,
        "owner",
        await config("supportBot.applicationId"),
        "Member Left"
      ),
    ]);
  }
}
