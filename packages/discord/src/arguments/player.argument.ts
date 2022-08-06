/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Container from "typedi";
import {
  APIApplicationCommandOptionChoice,
  ApplicationCommandOptionType,
} from "discord-api-types/v10";
import { AbstractArgument } from "./abstract.argument";
import { ApiService } from "../services";
import { CommandContext } from "../command";
import { LocalizationString } from "../messages";

const apiClient = Container.get(ApiService);

export class PlayerArgument extends AbstractArgument {
  public description: LocalizationString;
  public type = ApplicationCommandOptionType.String;
  public autocomplete = true;

  public constructor(public name = "player", public required = false) {
    super();
    this.description = (t) => t("arguments.player");
  }

  public async autocompleteHandler(
    context: CommandContext
  ): Promise<APIApplicationCommandOptionChoice[]> {
    const query = context.option<string>(this.name).toLowerCase();

    const searched = { name: query, value: query };

    if (query.length > 16) return [searched];

    const players = await apiClient.getPlayerAutocomplete(query);

    let results = players.map((p) => ({ name: p, value: p }));

    if (query && (!players.length || !players.some((p) => p.toLowerCase() === query))) {
      results = results.slice(0, 24);
      results.push(searched);
    }

    return results;
  }
}
