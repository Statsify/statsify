/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AbstractArgument, CommandContext, LocalizationString } from '@statsify/discord';
import { ClassMetadata, LeaderboardScanner, METADATA_KEY, PlayerStats } from '@statsify/schemas';
import { removeFormatting } from '@statsify/util';
import {
  APIApplicationCommandOptionChoice,
  ApplicationCommandOptionType,
} from 'discord-api-types/v10';
import Fuse from 'fuse.js';

const entries = Object.entries(
  Reflect.getMetadata(METADATA_KEY, PlayerStats.prototype) as ClassMetadata
);

const fields = entries.reduce((acc, [prefix, value]) => {
  const list = LeaderboardScanner.getLeaderboardMetadata(value.type.type).map(
    ([key, { leaderboard }]) => ({ value: key, name: removeFormatting(leaderboard.name) })
  );

  const fuse = new Fuse(list, {
    keys: ['name', 'key'],
    includeScore: false,
    shouldSort: true,
    isCaseSensitive: false,
    threshold: 0.3,
    ignoreLocation: true,
  });

  return { ...acc, [prefix]: [fuse, list] };
}, {} as Record<keyof PlayerStats, [Fuse<APIApplicationCommandOptionChoice>, APIApplicationCommandOptionChoice[]]>);

export class PlayerLeaderboardArgument extends AbstractArgument {
  public name = 'leaderboard';
  public description: LocalizationString;
  public type = ApplicationCommandOptionType.String;
  public required = true;
  public autocomplete = true;

  public constructor(private prefix: keyof PlayerStats) {
    super();
    this.description = (t) => t('arguments.player-leaderboard');
  }

  public autocompleteHandler(context: CommandContext): APIApplicationCommandOptionChoice[] {
    const currentValue = context.option<string>(this.name, '').toLowerCase();

    const [fuse, list] = fields[this.prefix];

    if (!currentValue) return list.slice(0, 25);

    return fuse
      .search(currentValue)
      .map((result) => result.item)
      .slice(0, 25);
  }
}
