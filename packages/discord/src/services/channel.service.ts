/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  APIChannel,
  APIDMChannel,
  APIGuildCreatePartialChannel,
  APIMessage,
} from "discord-api-types/v10";
import { API } from "@discordjs/core/http-only";
import { Service } from "typedi";

@Service()
export class ChannelService {
  public constructor(private readonly api: API) {}

  public async create(userId: string): Promise<APIDMChannel>;
  public async create(
    guildId: string,
    channel: APIGuildCreatePartialChannel
  ): Promise<APIChannel>;
  public async create(
    guildIdOrUserId: string,
    channel?: APIGuildCreatePartialChannel
  ): Promise<APIChannel | APIDMChannel> {
    if (channel) return this.api.guilds.createChannel(guildIdOrUserId, channel);
    return this.api.users.createDM(guildIdOrUserId);
  }

  public async delete(channelId: string): Promise<void> {
    await this.api.channels.delete(channelId);
  }

  public async getMessages(channelId: string): Promise<APIMessage[]> {
    // 100 is the most messages Discord returns in one request
    return this.api.channels.getMessages(channelId, { limit: 100 });
  }

  public async bulkDelete(channelId: string, messages: string[]) {
    return this.api.channels.bulkDeleteMessages(channelId, messages);
  }
}
