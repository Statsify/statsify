/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { CommandResolvable } from "./command.resolvable";
import { Constructor } from "@statsify/util";
import type { CommandMetadata, SubCommandMetadata } from "./command.interface";

export class CommandBuilder {
  public static scan<T>(target: T, constructor: Constructor<T>) {
    const commandMetadata = Reflect.getMetadata(
      "statsify:command",
      constructor
    ) as CommandMetadata;

    if (!commandMetadata) {
      throw new Error(`Command metadata not found on ${constructor.name}`);
    }

    const commandResolvable = new CommandResolvable(commandMetadata, target);

    const subcommandMetadata = Reflect.getMetadata(
      "statsify:subcommand",
      target
    ) as Record<string, SubCommandMetadata>;

    if (!subcommandMetadata) return commandResolvable;

    const groups: Record<string, CommandResolvable> = {};

    for (const subcommand of Object.values(subcommandMetadata)) {
      const subcommandResolvable = new CommandResolvable(subcommand, target);

      let addSubCommandTo: CommandResolvable = commandResolvable;

      if (subcommand.group && subcommand.group in groups) {
        addSubCommandTo = groups[subcommand.group];
      } else if (subcommand.group) {
        const options = {
          name: subcommand.group,
          methodName: "run",
          description: "group",
        };

        addSubCommandTo = new CommandResolvable(options, target);
        groups[options.name] = addSubCommandTo;
      }

      addSubCommandTo.addCommand(subcommandResolvable.asSubCommand());
    }

    for (const group of Object.values(groups)) {
      commandResolvable.addCommand(group.asSubCommandGroup());
    }

    return commandResolvable;
  }
}
