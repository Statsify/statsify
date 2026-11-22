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
import { ClassMetadata, FormattedGame, GameCounts, METADATA_KEY } from "@statsify/schemas";
import { removeFormatting } from "@statsify/util";

const GAME_CHOICES = (
  Object.keys(
    Reflect.getMetadata(METADATA_KEY, GameCounts.prototype) as ClassMetadata
  ) as (keyof GameCounts)[]
).map((id) => ({ name: removeFormatting(FormattedGame[id]), value: id }));

const GAME_FUSE = new Fuse(GAME_CHOICES, {
  keys: ["name", "value"],
  includeScore: false,
  shouldSort: true,
  isCaseSensitive: false,
  threshold: 0.3,
  ignoreLocation: true,
});

export const findGameId = (input: string) => {
  const query = input.toLowerCase();

  return GAME_CHOICES.find(
    ({ name, value }) => value.toLowerCase() === query || name.toLowerCase() === query
  )?.value;
};

export class GameArgument extends AbstractArgument {
  public name = "game";
  public description: LocalizationString;
  public type = ApplicationCommandOptionType.String;
  public required = false;
  public autocomplete = true;

  public constructor() {
    super();
    this.description = (t) => t("arguments.game");
  }

  public autocompleteHandler(
    context: CommandContext
  ): APIApplicationCommandOptionChoice[] {
    const currentValue = context.option<string>(this.name, "").toLowerCase();

    if (!currentValue) return GAME_CHOICES.slice(0, 25);

    return GAME_FUSE
      .search(currentValue)
      .map((result) => result.item)
      .slice(0, 25);
  }
}
