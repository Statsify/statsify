import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
import i18next from 'i18next';
import { AbstractArgument } from '../arguments';
import { translateField, translateToAllLanguages } from '../messages/localize';
import type { CommandContext } from './command.context';
import type { CommandMetadata } from './command.interface';

export class CommandResolvable {
  public type:
    | ApplicationCommandType.ChatInput
    | ApplicationCommandOptionType.Subcommand
    | ApplicationCommandOptionType.SubcommandGroup;
  public name: string;
  public description: string;
  public options?: any[];
  public description_localizations: Record<string, string>;

  public args: AbstractArgument[];
  public cooldown: number;
  private target: any;
  private methodName: string;

  public constructor(
    { name, description, args, methodName, cooldown = 0 }: CommandMetadata,
    target: any
  ) {
    this.name = name;
    this.description = translateField(i18next.getFixedT('en-US'), description);
    this.description_localizations = translateToAllLanguages(description);

    this.type = ApplicationCommandType.ChatInput;
    this.cooldown = cooldown;

    const argsResolved = (args ?? [])?.map((a) => (a instanceof AbstractArgument ? a : new a()));

    this.args = argsResolved;
    this.options = argsResolved;

    this.target = target;
    this.methodName = methodName;
  }

  public execute(context: CommandContext) {
    const method = this.target[this.methodName];

    return method.apply(this.target, [context]);
  }

  public addSubCommand(subcommand: CommandResolvable) {
    this.options ??= [];

    subcommand.type = ApplicationCommandOptionType.Subcommand;

    this.options.push(subcommand);
  }

  public addSubCommandGroup(group: CommandResolvable) {
    this.options ??= [];

    group.type = ApplicationCommandOptionType.SubcommandGroup;

    this.options.push(group);
  }

  public toJSON() {
    return {
      name: this.name,
      description: this.description,
      description_localizations: this.description_localizations,
      type: this.type,
      options: this.options?.map((o) => (o.toJSON ? o.toJSON() : o)),
    };
  }
}
