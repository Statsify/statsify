import { Constructor } from '@statsify/util';
import { Container } from 'typedi';
import type { CommandMetadata, SubCommandMetadata } from './command.interface';
import { CommandResolvable } from './command.resolvable';

export class CommandBuilder {
  public static scan<T>(target: T, constructor: Constructor<T>) {
    const commandMetadata = Reflect.getMetadata('statsify:command', constructor) as CommandMetadata;

    if (!commandMetadata) {
      throw new Error(`Command metadata not found on ${constructor.name}`);
    }

    const commandResolvable = new CommandResolvable(commandMetadata, target);

    (commandMetadata.groups ?? []).forEach((group) => {
      const groupResolvable = CommandBuilder.scan(Container.get(group), group);
      commandResolvable.addSubCommandGroup(groupResolvable);
    });

    const methodNames = Object.getOwnPropertyNames(constructor.prototype);

    for (const methodName of methodNames) {
      const subcommandMetadata = Reflect.getMetadata(
        'statsify:subcommand',
        target,
        methodName
      ) as SubCommandMetadata;

      if (!subcommandMetadata) continue;

      const subcommandResolvable = new CommandResolvable(subcommandMetadata, target);

      commandResolvable.addSubCommand(subcommandResolvable);
    }

    return commandResolvable;
  }
}
