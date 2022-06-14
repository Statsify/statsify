import { AbstractArgument, LocalizationString } from '@statsify/discord';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';

export class MojangPlayerArgument extends AbstractArgument {
  public name = 'player';
  public description: LocalizationString;
  public type = ApplicationCommandOptionType.String;

  public constructor(public required = false) {
    super();
    this.description = (t) => t('arguments.mojang-player');
  }
}
