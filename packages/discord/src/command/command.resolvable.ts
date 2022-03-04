import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
import type { CommandMetadata, SubCommandMetadata } from './command.interface';

export class CommandResolvable {
  public type: ApplicationCommandType;
  public name: string;
  public description: string;
  public options?: any[];

  public constructor({ name, description }: CommandMetadata) {
    this.name = name;
    this.description = description;
    this.type = ApplicationCommandType.ChatInput;
  }

  public addSubCommand({ name, description }: SubCommandMetadata) {
    this.options ??= [];

    this.options.push({
      name,
      description,
      type: ApplicationCommandOptionType.Subcommand,
    });
  }

  public addSubCommandGroup(group: CommandResolvable) {
    this.options ??= [];

    this.options.push({
      ...group,
      type: ApplicationCommandOptionType.SubcommandGroup,
    });
  }
}
