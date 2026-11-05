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
  METADATA_KEY,
  PlayerStats,
  getLeaderboardFields,
} from "@statsify/schemas";
import { removeFormatting } from "@statsify/util";

type LeaderboardChoice = APIApplicationCommandOptionChoice<string> & { aliases?: string[] };

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
  const list = getLeaderboardFields(value.type.type).map(
    ([key, { leaderboard }]) => ({ value: key, name: removeFormatting(leaderboard.name) })
  );

  const fuse = new Fuse(list, FUSE_OPTIONS);
  acc[prefix as keyof PlayerStats] = [fuse, list];

  return acc;
}, {} as Record<keyof PlayerStats, [Fuse<LeaderboardChoice>, LeaderboardChoice[]]>);

export class PlayerLeaderboardArgument extends AbstractArgument {
  public name = "leaderboard";
  public description: LocalizationString;
  public type = ApplicationCommandOptionType.String;
  public required = true;
  public autocomplete = true;

  private fuse: Fuse<LeaderboardChoice>;
  private list: LeaderboardChoice[];

  public constructor(prefix: keyof PlayerStats, modes?: GameModes<any>) {
    super();
    this.description = (t) => t("arguments.player-leaderboard");

    [this.fuse, this.list] = fields[prefix];

    if (modes) {
      this.list = this.list.map((choice) => ({ ...choice, aliases: this.getAliases(choice.value, modes) }));
      this.fuse = new Fuse(this.list, FUSE_OPTIONS);
    }
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
    const mode = modes.getModes().find(({ api }) => api === modeKey);
    const submode = mode?.submodes.find(({ api }) => api === submodeKey);

    return [...mode?.aliases ?? [], ...submode?.aliases ?? []];
  }

  private toChoices(choices: LeaderboardChoice[]): APIApplicationCommandOptionChoice[] {
    return choices.map(({ name, value }) => ({ name, value }));
  }
}
