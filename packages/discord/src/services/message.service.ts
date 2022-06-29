/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { IMessage, Message } from "../messages";
import { RestClient } from "tiny-discord";
import { Service } from "typedi";
import { getLocalizeFunction } from "../messages/localize";
import { parseDiscordResponse } from "../util/parse-discord-error";

@Service()
export class MessageService {
  public constructor(private readonly rest: RestClient) {}

  public async send(id: string, message: Message | IMessage) {
    const data = message instanceof Message ? message : new Message(message);

    const response = await this.rest.post(
      `/channels/${id}/messages`,
      data.toAPI(getLocalizeFunction("en-US"))
    );

    return parseDiscordResponse(response);
  }
}
