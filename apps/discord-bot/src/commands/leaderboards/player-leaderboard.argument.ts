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
import {
  ClassMetadata,
  HistoricalScanner,
  LeaderboardScanner,
  METADATA_KEY,
  PlayerStats,
} from "@statsify/schemas";
import { CurrentHistoricalType } from "@statsify/api-client";
import { removeFormatting } from "@statsify/util";

const entries = Object.entries(
  Reflect.getMetadata(METADATA_KEY, PlayerStats.prototype) as ClassMetadata
);

export const SHORT_TO_LONG_HISTORICAL_TYPE: {
  [key: string]: CurrentHistoricalType | undefined;
} = {
  L: undefined,
  D: CurrentHistoricalType.DAILY,
  W: CurrentHistoricalType.WEEKLY,
  M: CurrentHistoricalType.MONTHLY,
};

const FUSE_OPTIONS = {
  keys: ["name", "key"],
  includeScore: false,
  shouldSort: true,
  isCaseSensitive: false,
  threshold: 0.3,
  ignoreLocation: true,
};

const fields = entries.reduce((acc, [prefix, value]) => {
  const list = LeaderboardScanner.getLeaderboardMetadata(value.type.type).map(
    ([key, { leaderboard }]) => ({ value: key, name: removeFormatting(leaderboard.name) })
  );

  const fuse = new Fuse(list, FUSE_OPTIONS);

  return { ...acc, [prefix]: [fuse, list] };
}, {} as Record<keyof PlayerStats, [Fuse<APIApplicationCommandOptionChoice>, APIApplicationCommandOptionChoice[]]>);

const historicalFields = entries.reduce((acc, [prefix, value]) => {
  const list = HistoricalScanner.getHistoricalMetadata(value.type.type)
    .filter(([, { historical }]) => historical.enabled)
    .map(([key, { historical }]) => ({
      value: key,
      name: removeFormatting(historical.name),
    }));

  const fuse: Fuse<any> = new Fuse(list, FUSE_OPTIONS);

  return { ...acc, [prefix]: [fuse, list] };
}, {} as Record<keyof PlayerStats, [Fuse<APIApplicationCommandOptionChoice>, APIApplicationCommandOptionChoice[]]>);

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
    const time = context.option<keyof typeof SHORT_TO_LONG_HISTORICAL_TYPE | undefined>(
      "time"
    );

    const currentTime = SHORT_TO_LONG_HISTORICAL_TYPE[time ?? "L"];

    const currentValue = context.option<string>(this.name, "").toLowerCase();

    const [fuse, list] = currentTime
      ? historicalFields[this.prefix]
      : fields[this.prefix];

    if (!currentValue) return list.slice(0, 25);

    return fuse
      .search(currentValue)
      .map((result) => result.item)
      .slice(0, 25);
  }
}
