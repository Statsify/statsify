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
import { AutocompleteType, MAX_AUTOCOMPLETE_CHOICES } from "@statsify/api-client";
import { CommandContext } from "#command";
import { Container } from "typedi";
import { LocalizationString } from "#messages";

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
    return autocompleteNames(query, 16, () =>
      apiClient.getAutocomplete(AutocompleteType.PLAYER, context.getInteraction().getUserId(), query)
    );
  }

  public autocompleteType() {
    return AutocompleteType.PLAYER;
  }
}

/** Offers the typed query as the last choice when no result matches it exactly */
export async function autocompleteNames(
  query: string,
  maxLength: number,
  search: () => Promise<string[]>
): Promise<APIApplicationCommandOptionChoice[]> {
  const searched = { name: query, value: query };

  // Discord rejects the whole list when a choice is over 100 characters
  if (query.length > 100) return [];
  if (query.length > maxLength) return [searched];

  const names = await search();
  const results = names.map((name) => ({ name, value: name }));

  if (!query || names.some((name) => name.toLowerCase() === query.toLowerCase())) return results;

  return [...results.slice(0, MAX_AUTOCOMPLETE_CHOICES - 1), searched];
}
