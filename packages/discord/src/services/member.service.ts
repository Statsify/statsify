/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { API } from "@discordjs/core/http-only";
import { Service } from "typedi";

@Service()
export class MemberService {
  public constructor(private readonly api: API) {}

  public async addRole(guildId: string, userId: string, roleId: string) {
    return this.api.guilds.addRoleToMember(guildId, userId, roleId);
  }

  public async removeRole(guildId: string, userId: string, roleId: string) {
    return this.api.guilds.removeRoleFromMember(guildId, userId, roleId);
  }

  public async changeNickname(guildId: string, userId: string, nick: string) {
    return this.api.guilds.editMember(guildId, userId, { nick });
  }
}
