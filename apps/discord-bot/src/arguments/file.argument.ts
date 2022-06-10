import { AbstractArgument, LocalizationString } from '@statsify/discord';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';

export class FileArgument extends AbstractArgument {
  public description: LocalizationString;
  public type = ApplicationCommandOptionType.Attachment;
  public required = false;

  public constructor(public name = 'file') {
    super();
    this.description = (t) => t('arguments.file');
  }
}
