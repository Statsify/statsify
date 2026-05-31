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
  type GameModes,
  LeaderboardScanner,
  METADATA_KEY,
  PlayerStats,
} from "@statsify/schemas";
import { removeFormatting } from "@statsify/util";

type LeaderboardChoice = APIApplicationCommandOptionChoice & { aliases?: string[] };

const entries = Object.entries(
  Reflect.getMetadata(METADATA_KEY, PlayerStats.prototype) as ClassMetadata
);

const FUSE_OPTIONS = {
  keys: ["name", "value", "aliases"],
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
}, {} as Record<keyof PlayerStats, [Fuse<LeaderboardChoice>, LeaderboardChoice[]]>);

export class PlayerLeaderboardArgument extends AbstractArgument {
  public name = "leaderboard";
  public description: LocalizationString;
  public type = ApplicationCommandOptionType.String;
  public required = true;
  public autocomplete = true;

  private fuse: Fuse<LeaderboardChoice>;
  private list: LeaderboardChoice[];

  public constructor(private prefix: keyof PlayerStats, modes?: GameModes<any>) {
    super();
    this.description = (t) => t("arguments.player-leaderboard");

    const [, baseList] = fields[this.prefix];
    this.list = modes ?
      baseList.map((choice) => ({
        ...choice,
        aliases: this.getAliases(choice.value as string, modes),
      })) :
      baseList;

    this.fuse = new Fuse(this.list, FUSE_OPTIONS);
  }

  public autocompleteHandler(
    context: CommandContext
  ): APIApplicationCommandOptionChoice[] {
    const currentValue = context.option<string>(this.name, "").toLowerCase();

    if (!currentValue) return this.toChoices(this.list.slice(0, 25));

    return this.toChoices(
      this.fuse
        .search(currentValue)
        .map((result) => result.item)
        .slice(0, 25)
    );
  }

  private getAliases(key: string, modes: GameModes<any>): string[] {
    const [modeKey, submodeKey] = key.split(".");
    const aliases = new Set<string>();

    const mode = modes.getModes().find(({ api }) => api === modeKey);

    if (!mode) return [];

    mode.aliases.forEach((alias: string) => aliases.add(alias));
    mode.submodes
      .find(({ api }) => api === submodeKey)
      ?.aliases.forEach((alias: string) => aliases.add(alias));

    return [...aliases];
  }

  private toChoices(choices: LeaderboardChoice[]): APIApplicationCommandOptionChoice[] {
    return choices.map(({ name, value }) => ({ name, value }));
  }
}
