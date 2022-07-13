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
import { HypixelCache } from "@statsify/api-client";
import { Logger } from "@statsify/logger";
import { Service } from "typedi";
import { SimpleIntervalJob, Task } from "toad-scheduler";
import { config } from "@statsify/util";

@Service()
export class MessageCreateEventListener extends AbstractEventListener<GatewayDispatchEvents.MessageCreate> {
  public event = GatewayDispatchEvents.MessageCreate as const;
  private cache: string[];
  private readonly job: SimpleIntervalJob;
  private readonly logger = new Logger("MessageCreateEventListener");

  public constructor(
    private readonly apiService: ApiService,
    private readonly memberService: MemberService
  ) {
    super();

    this.cache = [];

    const task = new Task("resetNameUpdateCache", () => {
      this.cache = [];
    });

    this.job = new SimpleIntervalJob({ minutes: 30 }, task);
    this.job.start();
  }

  public async onEvent(data: GatewayMessageCreateDispatchData): Promise<void> {
    const guildId = config("supportBot.guild");
    const memberRole = config("supportBot.memberRole");

    if (data.author.bot || data.guild_id !== guildId) return;
    if (!data.member?.roles.includes(memberRole)) return;

    const userId = data.author.id;

    if (this.cache.includes(userId)) return;

    const user = await this.apiService.getUser(userId);

    if (!user || !user.uuid) {
      await this.memberService.removeRole(guildId, userId, memberRole);
      return;
    }

    const player = await this.apiService
      .getCachedPlayer(user.uuid, HypixelCache.CACHE_ONLY)
      .catch(() => null);

    if (!player) {
      this.logger.error(`Could not get player for ${user.id} | ${user.uuid}`);
      return;
    }

    await this.memberService.changeNickname(guildId, userId, player.username);

    this.cache.push(userId);
  }
}
