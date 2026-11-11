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
import { AbstractArgument, CommandContext, LocalizationString } from "@statsify/discord";
import {
  ClassMetadata,
  METADATA_KEY,
  PlayerStats,
  getLeaderboardFields,
} from "@statsify/schemas";
import { LeaderboardChoices } from "./leaderboard-names.js";

const entries = Object.entries(
  Reflect.getMetadata(METADATA_KEY, PlayerStats.prototype) as ClassMetadata
);

const choices = Object.fromEntries(
  entries.map(([prefix, value]) => [
    prefix,
    new LeaderboardChoices(getLeaderboardFields(value.type.type)),
  ])
) as Record<keyof PlayerStats, LeaderboardChoices>;

export class PlayerLeaderboardArgument extends AbstractArgument {
  public name = "leaderboard";
  public description: LocalizationString;
  public type = ApplicationCommandOptionType.String;
  public required = true;
  public autocomplete = true;

  public constructor(private prefix: keyof PlayerStats) {
    super();
    this.description = (t) => t("arguments.player-leaderboard");
  }

  public autocompleteHandler(
    context: CommandContext
  ): APIApplicationCommandOptionChoice[] {
    const currentValue = context.option<string>(this.name, "").toLowerCase();
    return choices[this.prefix].search(context.t(), currentValue);
  }
}
