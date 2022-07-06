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
import { RestClient } from "tiny-discord";
import { Service } from "typedi";
import { parseDiscordResponse } from "../util/parse-discord-error";

@Service()
export class ChannelService {
  public constructor(private readonly rest: RestClient) {}

  public async create(userId: string): Promise<APIDMChannel>;
  public async create(
    guildId: string,
    channel: APIGuildCreatePartialChannel
  ): Promise<APIChannel>;
  public async create(
    guildIdOrUserId: string,
    channel?: APIGuildCreatePartialChannel
  ): Promise<APIChannel | APIDMChannel> {
    if (channel) {
      const response = await this.rest.post(
        `/guilds/${guildIdOrUserId}/channels`,
        channel
      );

      return parseDiscordResponse(response);
    }

    const response = await this.rest.post(`/users/@me/channels`, {
      recipient_id: guildIdOrUserId,
    });

    return parseDiscordResponse(response);
  }

  public async delete(channelId: string): Promise<void> {
    const response = await this.rest.delete(`/channels/${channelId}`);
    parseDiscordResponse(response);
  }

  public async getMessages(channelId: string): Promise<APIMessage[]> {
    const response = await this.rest.get(`/channels/${channelId}/messages`);
    return parseDiscordResponse(response);
  }

  public async bulkDelete(channelId: string, messages: string[]) {
    const response = await this.rest.post(`/channels/${channelId}/messages/bulk-delete`, {
      messages,
    });

    return parseDiscordResponse(response);
  }
}
