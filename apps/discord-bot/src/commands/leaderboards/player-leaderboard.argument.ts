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
import {
  AbstractArgument,
  ApiService,
  CommandContext,
  LocalizationString,
} from "@statsify/discord";
import {
  ClassMetadata,
  LeaderboardScanner,
  METADATA_KEY,
  PlayerStats,
} from "@statsify/schemas";
import { Container } from "typedi";
import { removeFormatting } from "@statsify/util";

const apiClient = Container.get(ApiService);

const entries = Object.entries(
  Reflect.getMetadata(METADATA_KEY, PlayerStats.prototype) as ClassMetadata
);

const FUSE_OPTIONS = {
  keys: ["name", "key"],
  includeScore: false,
  shouldSort: true,
  isCaseSensitive: false,
  threshold: 0.3,
  ignoreLocation: true,
};

const fields = entries.reduce((acc, [prefix, value]) => {
  const list = LeaderboardScanner.getLeaderboardFields(value.type.type).map(
    ([key, { leaderboard }]) => ({ value: key, name: removeFormatting(leaderboard.name) })
  );

  const fuse = new Fuse(list, FUSE_OPTIONS);

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
    const currentValue = context.option<string>(this.name, "").toLowerCase();

    const [fuse, list] = fields[this.prefix];

    if (!currentValue) return list.slice(0, 25);

    return fuse
      .search(currentValue)
      .map((result) => result.item)
      .slice(0, 25);
  }
}

export class PlayerLeaderboardGuildArgument extends AbstractArgument {
  public name = "guild";
  public description: LocalizationString;
  public type = ApplicationCommandOptionType.String;
  public required = false;
  public autocomplete = true;

  public constructor() {
    super();
    this.description = (t) => t("arguments.guild-filter");
  }

  public async autocompleteHandler(
    context: CommandContext
  ): Promise<APIApplicationCommandOptionChoice[]> {
    const query = context.option<string>(this.name, "").toLowerCase();

    const searched = { name: query, value: query };

    if (!query) {
      const guilds = await apiClient.getGuildAutocomplete(query);

      return guilds.map((guild) => ({ name: guild, value: guild }));
    }

    if (query.length > 32) return [searched];

    const guilds = await apiClient.getGuildAutocomplete(query);

    let results = guilds.map((guild) => ({ name: guild, value: guild }));

    if (query && (!guilds.length || !guilds.some((guild) => guild.toLowerCase() === query))) {
      results = results.slice(0, 24);
      results.push(searched);
    }

    return results;
  }
}

export const createPlayerLeaderboardArguments = (prefix: keyof PlayerStats) => [
  new PlayerLeaderboardArgument(prefix),
  new PlayerLeaderboardGuildArgument(),
];
