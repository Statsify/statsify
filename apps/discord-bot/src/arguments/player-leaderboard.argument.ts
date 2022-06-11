import { AbstractArgument, CommandContext, LocalizationString } from '@statsify/discord';
import { ClassMetadata, LeaderboardScanner, METADATA_KEY, PlayerStats } from '@statsify/schemas';
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
    ([key, { leaderboard }]) => ({ key, name: leaderboard.name })
  );

  const fuse = new Fuse(list, {
    keys: ['key', 'name'],
    includeScore: false,
    shouldSort: true,
    threshold: 0.5,
  });

  return { ...acc, [prefix]: fuse };
}, {} as Record<keyof PlayerStats, Fuse<{ name: string; key: string }>>);

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

    const fuse = fields[this.prefix];

    return fuse
      .search(currentValue)
      .map((result) => ({
        name: result.item.name,
        value: result.item.key,
      }))
      .splice(0, 25);
  }
}
