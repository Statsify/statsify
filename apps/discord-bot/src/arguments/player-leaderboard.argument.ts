import { AbstractArgument, CommandContext, LocalizationString } from '@statsify/discord';
import { LeaderboardScanner, Player } from '@statsify/schemas';
import {
  APIApplicationCommandOptionChoice,
  ApplicationCommandOptionType,
} from 'discord-api-types/v10';

const fields = LeaderboardScanner.getLeaderboardMetadata(Player).map(([key]) =>
  key.replace('stats.', '').replace(/\./g, ' ').toLowerCase()
);

export class PlayerLeaderboardArgument extends AbstractArgument {
  public name = 'leaderboard';
  public description: LocalizationString;
  public type = ApplicationCommandOptionType.String;
  public required = true;
  public autocomplete = true;

  public constructor() {
    super();
    this.description = (t) => t('arguments.player-leaderboard');
  }

  public autocompleteHandler(context: CommandContext): APIApplicationCommandOptionChoice[] {
    const currentValue = context.option<string>(this.name, '').toLowerCase().split(' ');

    //TODO(jacobk999):  use some sort of fuzzy searching
    return fields
      .filter((field) => currentValue.some((value) => field.includes(value)))
      .splice(0, 25)
      .map((field) => ({ name: field, value: field }));
  }
}
