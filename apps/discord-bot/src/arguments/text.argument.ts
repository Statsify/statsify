import { AbstractArgument } from '@statsify/discord';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';

export class TextArgument extends AbstractArgument {
  public description = 'Text input';
  public type = ApplicationCommandOptionType.String;
  public required = true;

  public constructor(public name = 'content') {
    super();
  }
}
