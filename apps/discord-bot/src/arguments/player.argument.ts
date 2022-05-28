import { AbstractArgument, LocalizationString } from '@statsify/discord';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';

export class PlayerArgument extends AbstractArgument {
  public description: LocalizationString;
  public type = ApplicationCommandOptionType.String;
  public required = false;

  public constructor(public name = 'player') {
    super();
    this.description = (t) => t('arguments.player');
  }
}
