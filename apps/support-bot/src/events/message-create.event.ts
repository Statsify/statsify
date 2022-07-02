/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AbstractEventListener, ApiService, MemberService } from "@statsify/discord";
import {
  GatewayDispatchEvents,
  GatewayMessageCreateDispatchData,
} from "discord-api-types/v10";
import { config } from "@statsify/util";

export class MessageCreateEventListener extends AbstractEventListener<GatewayDispatchEvents.MessageCreate> {
  public event = GatewayDispatchEvents.MessageCreate as const;

  public constructor(
    private readonly apiService: ApiService,
    private readonly memberService: MemberService
  ) {
    super();
  }

  public async onEvent(data: GatewayMessageCreateDispatchData): Promise<void> {
    const guildId = config("supportBot.guild");
    const memberRole = config("supportBot.memberRole");

    if (data.author.bot || data.guild_id !== guildId) return;
    if (!data.member?.roles.includes(memberRole)) return;

    const userId = data.author.id;

    const user = await this.apiService.getUser(userId);

    if (!user || !user.uuid) {
      await this.memberService.removeRole(guildId, userId, memberRole);
      return;
    }

    //TODO(jacobk999): Make this cache only
    const player = await this.apiService.getPlayer(user.uuid).catch(() => null);
    if (!player) return;

    await this.memberService.changeNickname(guildId, userId, player.username);
  }
}
