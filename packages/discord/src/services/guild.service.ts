/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { API } from "@discordjs/core/http-only";
import { APIGuild } from "discord-api-types/v10";
import { Service } from "typedi";

@Service()
export class GuildService {
  public constructor(private readonly api: API) {}

  public async get(guildId: string): Promise<APIGuild> {
    return this.api.guilds.get(guildId, { with_counts: true });
  }
}
