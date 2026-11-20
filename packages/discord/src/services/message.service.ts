/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIMessage } from "discord-api-types/v10";
import { IMessage, Message, getLocalizeFunction } from "#messages";
import { API } from "@discordjs/core/http-only";
import { Service } from "typedi";

@Service()
export class MessageService {
  public constructor(private readonly api: API) {}

  public async send(channelId: string, message: Message | IMessage): Promise<APIMessage> {
    const data = message instanceof Message ? message : new Message(message);
    return this.api.channels.createMessage(channelId, data.toAPI(getLocalizeFunction("en-US")));
  }

  public async edit(channelId: string, messageId: string, message: Message | IMessage) {
    const data = message instanceof Message ? message : new Message(message);

    return this.api.channels.editMessage(
      channelId,
      messageId,
      data.toAPI(getLocalizeFunction("en-US"))
    );
  }

  public async delete(channelId: string, messageId: string) {
    return this.api.channels.deleteMessage(channelId, messageId);
  }
}
