/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  APIApplicationCommandOptionChoice,
  ApplicationCommandOptionType,
} from "discord-api-types/v10";
import { AbstractArgument } from "./abstract.argument.js";
import { ApiService } from "#services";
import { AutocompleteType, GuildQuery } from "@statsify/api-client";
import { ChoiceArgument } from "./choice.argument.js";
import { CommandContext } from "#command";
import { Container } from "typedi";
import { LocalizationString } from "#messages";
import { PlayerArgument } from "./player.argument.js";

const apiClient = Container.get(ApiService);

class GuildQueryArgument extends AbstractArgument {
  public description: LocalizationString;
  public name = "query";
  public type = ApplicationCommandOptionType.String;
  public required = false;
  public autocomplete = true;

  private playerArgument = new PlayerArgument(this.name);

  public constructor() {
    super();
    this.description = (t) => t("arguments.guild-query");
  }

  public async autocompleteHandler(
    context: CommandContext
  ): Promise<APIApplicationCommandOptionChoice[]> {
    const type = context.option<GuildQuery>("type");

    if (type === GuildQuery.PLAYER) return this.playerArgument.autocompleteHandler(context);
    if (type === GuildQuery.ID) return [];

    const query = context.option<string>(this.name, "");
    const searched = { name: query, value: query };

    // Discord rejects the whole list when a choice is over 100 characters
    if (query.length > 100) return [];
    if (query.length > 32) return [searched];

    const guilds = await apiClient.getAutocomplete(
      AutocompleteType.GUILD,
      context.getInteraction().getUserId(),
      query
    );

    let results = guilds.map((g) => ({ name: g, value: g }));

    if (query && !guilds.some((g) => g.toLowerCase() === query.toLowerCase())) {
      results = results.slice(0, 24);
      results.push(searched);
    }

    return results;
  }

  public autocompleteType(context: CommandContext) {
    const type = context.option<GuildQuery>("type");
    if (type === GuildQuery.ID) return undefined;
    return type === GuildQuery.PLAYER ? AutocompleteType.PLAYER : AutocompleteType.GUILD;
  }
}

class GuildTypeArgument extends ChoiceArgument {
  public constructor() {
    super({
      name: "type",
      required: false,
      choices: [
        ["name", GuildQuery.NAME],
        ["player", GuildQuery.PLAYER],
        ["id", GuildQuery.ID],
      ],
    });

    this.description = (t) => t("arguments.guild-type");
  }
}

export const GuildArgument = [GuildQueryArgument, GuildTypeArgument];
