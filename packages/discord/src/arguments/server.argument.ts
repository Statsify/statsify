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
import { AbstractArgument } from "./abstract.argument";
import { CommandContext } from "../command";
import { LocalizationString } from "../messages";
import { getServerMappings } from "@statsify/assets";

export class ServerArgument extends AbstractArgument {
  public name = "server";
  public description: LocalizationString;
  public type = ApplicationCommandOptionType.String;
  public required = true;
  public autocomplete = true;

  private fuse: Fuse<ReturnType<typeof getServerMappings>[number]>;

  public constructor() {
    super();
    this.description = (t) => t("arguments.server");

    const servers = getServerMappings();

    this.fuse = new Fuse(servers, {
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

    return this.fuse
      .search(currentValue)
      .map((result) => ({ name: result.item.name, value: result.item.addresses[0] }))
      .slice(0, 25);
  }
}
