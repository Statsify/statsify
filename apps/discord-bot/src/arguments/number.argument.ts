import { AbstractArgument } from '@statsify/discord';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';

export class NumberArgument extends AbstractArgument {
  public description = 'Number input';
  public type = ApplicationCommandOptionType.Integer;
  public required = false;

  public constructor(public name = 'count', public min_value?: number, public max_value?: number) {
    super();
  }
}
