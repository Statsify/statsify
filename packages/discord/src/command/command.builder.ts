/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

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

    const subcommandMetadata = Reflect.getMetadata(
      'statsify:subcommand',
      target
    ) as SubCommandMetadata;

    if (!subcommandMetadata) return commandResolvable;

    for (const subcommand of Object.values(subcommandMetadata)) {
      const subcommandResolvable = new CommandResolvable(subcommand, target);
      commandResolvable.addSubCommand(subcommandResolvable);
    }

    return commandResolvable;
  }
}
