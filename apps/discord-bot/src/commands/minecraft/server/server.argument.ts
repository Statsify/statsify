/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Fuse from "fuse.js";
import {
  APIApplicationCommandOptionChoice,
  ApplicationCommandOptionType,
} from "discord-api-types/v10";
import { AbstractArgument, CommandContext, LocalizationString } from "@statsify/discord";
import { type ServerMappingsServer, getServerMappings } from "./server.util.js";
import { setTimeout } from "node:timers/promises";

export class ServerArgument extends AbstractArgument {
  public name = "server";
  public description: LocalizationString;
  public type = ApplicationCommandOptionType.String;
  public required = true;
  public autocomplete = true;

  private fuse?: Fuse<ServerMappingsServer>;

  public constructor() {
    super();
    this.description = (t) => t("arguments.server");

    getServerMappings().catch(() => undefined);
  }

  public async autocompleteHandler(
    context: CommandContext
  ): Promise<APIApplicationCommandOptionChoice[]> {
    // Discord drops autocomplete answers after 3 seconds, so don't wait long for the mappings
    const servers = await Promise.race([getServerMappings(), setTimeout(250)]).catch(() => undefined);
    if (!servers) return [];

    const currentValue = context.option<string>(this.name, "").toLowerCase();

    if (!currentValue) {
      return servers
        .map((result) => ({ name: result.name, value: result.primaryAddress }))
        .slice(0, 25);
    }

    this.fuse ??= new Fuse(servers, {
      keys: ["id", "name", "addresses", "primaryAddress"],
      includeScore: false,
      shouldSort: true,
      isCaseSensitive: false,
      threshold: 0.3,
      ignoreLocation: true,
    });

    return this.fuse
      .search(currentValue)
      .map((result) => ({ name: result.item.name, value: result.item.primaryAddress }))
      .slice(0, 25);
  }
}
