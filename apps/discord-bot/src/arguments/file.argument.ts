import { AbstractArgument, LocalizationString } from '@statsify/discord';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';

export class FileArgument extends AbstractArgument {
  public description: LocalizationString;
  public type = ApplicationCommandOptionType.Attachment;

  public constructor(public name = 'file', public required = false) {
    super();
    this.description = (t) => t('arguments.file');
  }
}
