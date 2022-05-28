import { AbstractArgument, LocalizationString } from '@statsify/discord';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';

export class NumberArgument extends AbstractArgument {
  public description: LocalizationString;
  public type = ApplicationCommandOptionType.Integer;
  public required = false;

  public constructor(public name = 'count', public min_value?: number, public max_value?: number) {
    super();
    this.description = (t) => t('arguments.number');
  }
}
