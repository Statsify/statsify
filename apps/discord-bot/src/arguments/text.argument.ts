import { AbstractArgument, LocalizationString } from '@statsify/discord';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';

export class TextArgument extends AbstractArgument {
  public type = ApplicationCommandOptionType.String;

  public constructor(
    public name = 'content',
    public description: LocalizationString = (t) => t('arguments.text'),
    public required = true
  ) {
    super();
  }
}
