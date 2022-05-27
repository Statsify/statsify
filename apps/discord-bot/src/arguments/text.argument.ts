import { AbstractArgument } from '@statsify/discord';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';

export class TextArgument extends AbstractArgument {
  public type = ApplicationCommandOptionType.String;

  public constructor(
    public name = 'content',
    public description = 'Text input',
    public required = true
  ) {
    super();
  }
}
