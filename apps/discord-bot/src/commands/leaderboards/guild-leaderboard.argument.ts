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
import { Guild, getLeaderboardFields } from "@statsify/schemas";
import { LeaderboardChoices } from "./leaderboard-names.js";

const choices = new LeaderboardChoices(getLeaderboardFields(Guild));

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
    return choices.search(context.t(), currentValue);
  }
}
