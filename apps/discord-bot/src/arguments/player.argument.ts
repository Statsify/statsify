import { AbstractArgument, LocalizationString } from '@statsify/discord';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';

export class PlayerArgument extends AbstractArgument {
  public description: LocalizationString;
  public type = ApplicationCommandOptionType.String;

  public constructor(public name = 'player', public required = false) {
    super();
    this.description = (t) => t('arguments.player');
  }
}
