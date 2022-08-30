/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIMessage } from "discord-api-types/v10";
import { IMessage, Message, getLocalizeFunction } from "../messages/index.js";
import { RestClient } from "tiny-discord";
import { Service } from "typedi";
import { parseDiscordResponse } from "../util/parse-discord-error.js";

@Service()
export class MessageService {
  public constructor(private readonly rest: RestClient) {}

  public async send(channelId: string, message: Message | IMessage): Promise<APIMessage> {
    const data = message instanceof Message ? message : new Message(message);

    const response = await this.rest.post(
      `/channels/${channelId}/messages`,
      data.toAPI(getLocalizeFunction("en-US"))
    );

    return parseDiscordResponse(response);
  }

  public async edit(channelId: string, messageId: string, message: Message | IMessage) {
    const data = message instanceof Message ? message : new Message(message);

    const response = await this.rest.patch(
      `/channels/${channelId}/messages/${messageId}`,
      data.toAPI(getLocalizeFunction("en-US"))
    );

    return parseDiscordResponse(response);
  }

  public async delete(channelId: string, messageId: string) {
    const response = await this.rest.delete(
      `/channels/${channelId}/messages/${messageId}`
    );

    return parseDiscordResponse(response);
  }
}
