/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { RestClient } from "tiny-discord";
import { Service } from "typedi";
import { parseDiscordResponse } from "#util/parse-discord-error";

@Service()
export class MemberService {
  public constructor(private readonly rest: RestClient) {}

  public async addRole(guildId: string, userId: string, roleId: string) {
    const response = await this.rest.put(
      `/guilds/${guildId}/members/${userId}/roles/${roleId}`
    );

    return parseDiscordResponse(response);
  }

  public async removeRole(guildId: string, userId: string, roleId: string) {
    const response = await this.rest.delete(
      `/guilds/${guildId}/members/${userId}/roles/${roleId}`
    );

    return parseDiscordResponse(response);
  }

  public async changeNickname(guildId: string, userId: string, nick: string) {
    const response = await this.rest.patch(`/guilds/${guildId}/members/${userId}`, {
      nick,
    });

    return parseDiscordResponse(response);
  }
}
