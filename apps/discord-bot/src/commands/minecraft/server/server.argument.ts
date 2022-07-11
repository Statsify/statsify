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
import { getServerMappings } from "@statsify/assets";

type Server = ReturnType<typeof getServerMappings>[number];

export class ServerArgument extends AbstractArgument {
  public name = "server";
  public description: LocalizationString;
  public type = ApplicationCommandOptionType.String;
  public required = true;
  public autocomplete = true;

  private servers: Server[];
  private fuse: Fuse<Server>;

  public constructor() {
    super();
    this.description = (t) => t("arguments.server");

    this.servers = getServerMappings();

    this.fuse = new Fuse(this.servers, {
      keys: ["id", "name", "addresses"],
      includeScore: false,
      shouldSort: true,
      isCaseSensitive: false,
      threshold: 0.3,
      ignoreLocation: true,
    });
  }

  public autocompleteHandler(
    context: CommandContext
  ): APIApplicationCommandOptionChoice[] {
    const currentValue = context.option<string>(this.name, "").toLowerCase();

    if (!currentValue) {
      return this.servers
        .map((result) => ({ name: result.name, value: result.addresses[0] }))
        .slice(0, 25);
    }

    return this.fuse
      .search(currentValue)
      .map((result) => ({ name: result.item.name, value: result.item.addresses[0] }))
      .slice(0, 25);
  }
}
