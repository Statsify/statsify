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
import { Guild, LeaderboardScanner } from "@statsify/schemas";
import { LocalizationString } from "../messages";
import { removeFormatting } from "@statsify/util";

const list = LeaderboardScanner.getLeaderboardMetadata(Guild).map(
  ([key, { leaderboard }]) => ({
    value: key,
    name: removeFormatting(leaderboard.name),
  })
);

const fuse = new Fuse(list, {
  keys: ["name", "key"],
  includeScore: false,
  shouldSort: true,
  isCaseSensitive: false,
  threshold: 0.3,
  ignoreLocation: true,
});

export class GuildLeaderboardArgument extends AbstractArgument {
  public name = "leaderboard";
  public description: LocalizationString;
  public type = ApplicationCommandOptionType.String;
  public required = true;
  public autocomplete = true;

  public constructor() {
    super();
    this.description = (t) => t("arguments.guild-leaderboard");
  }

  public autocompleteHandler(
    context: CommandContext
  ): APIApplicationCommandOptionChoice[] {
    const currentValue = context.option<string>(this.name, "").toLowerCase();

    if (!currentValue) return list.slice(0, 25);

    return fuse
      .search(currentValue)
      .map((result) => result.item)
      .slice(0, 25);
  }
}
