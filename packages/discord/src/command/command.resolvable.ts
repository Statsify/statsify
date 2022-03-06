import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
import type { CommandMetadata, SubCommandMetadata } from './command.interface';

export class CommandResolvable {
  public type: ApplicationCommandType;
  public name: string;
  public description: string;
  public options?: any[];

  public constructor({ name, description, args }: CommandMetadata) {
    this.name = name;
    this.description = description;
    this.type = ApplicationCommandType.ChatInput;
    this.options = args;
  }

  public addSubCommand({ name, description, args }: SubCommandMetadata) {
    this.options ??= [];

    this.options.push({
      name,
      description,
      type: ApplicationCommandOptionType.Subcommand,
      options: args,
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
