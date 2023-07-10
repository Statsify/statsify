/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { CommandResolvable } from "./command.resolvable.js";
import type { CommandMetadata, SubCommandMetadata } from "./command.interface.js";
import type { Constructor } from "@statsify/util";

export class CommandBuilder {
  public static scan<T extends {}>(target: T, constructor: Constructor<T>) {
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

if (import.meta.vitest) {
  const { test, it, expect } = import.meta.vitest;

  const { Command } = await import("./command.decorator.js");
  const { SubCommand } = await import("./subcommand.decorator.js");
  const { AbstractArgument } = await import("../arguments/abstract.argument.js");

  const { ApplicationCommandOptionType, ApplicationCommandType } = await import(
    "discord-api-types/v10"
  );

  test("CommandBuilder", () => {
    it("should read basic metadata", () => {
      @Command({ description: "test" })
      class TestCommand {}

      expect(CommandBuilder.scan(new TestCommand(), TestCommand).toJSON()).toEqual({
        name: "test",
        description: "test",
        description_localizations: {},
        type: ApplicationCommandType.ChatInput,
        options: [],
      });
    });

    it("should read subcommands", () => {
      @Command({ description: "test" })
      class TestCommand {
        @SubCommand({ description: "test" })
        public subcommand() {
          //
        }
      }

      expect(CommandBuilder.scan(new TestCommand(), TestCommand).toJSON()).toEqual({
        name: "test",
        description: "test",
        description_localizations: {},
        type: ApplicationCommandType.ChatInput,
        options: [
          {
            name: "subcommand",
            description: "test",
            description_localizations: {},
            type: ApplicationCommandOptionType.Subcommand,
            options: [],
          },
        ],
      });
    });

    it("should read groups", () => {
      @Command({ description: "test" })
      class TestCommand {
        @SubCommand({ description: "test", group: "group" })
        public subcommand() {
          //
        }

        @SubCommand({ description: "test", group: "group" })
        public subcommand2() {
          //
        }

        @SubCommand({ description: "test", group: "group2" })
        public subcommand3() {
          //
        }
      }

      expect(CommandBuilder.scan(new TestCommand(), TestCommand).toJSON()).toEqual({
        name: "test",
        description: "test",
        type: ApplicationCommandType.ChatInput,
        description_localizations: {},
        options: [
          {
            name: "group",
            description: "group",
            description_localizations: {},
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
              {
                name: "subcommand",
                description: "test",
                description_localizations: {},
                type: ApplicationCommandOptionType.Subcommand,
                options: [],
              },
              {
                name: "subcommand2",
                description: "test",
                description_localizations: {},
                type: ApplicationCommandOptionType.Subcommand,
                options: [],
              },
            ],
          },
          {
            name: "group2",
            description: "group",
            description_localizations: {},
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
              {
                name: "subcommand3",
                description: "test",
                description_localizations: {},
                type: ApplicationCommandOptionType.Subcommand,
                options: [],
              },
            ],
          },
        ],
      });
    });

    it("should read arguments", () => {
      class Arg extends AbstractArgument {
        public name = "test";
        public description = "test";
        public required = true;
        public type = ApplicationCommandOptionType.String;
      }

      @Command({ description: "test", args: [Arg] })
      class TestCommand {}

      expect(CommandBuilder.scan(new TestCommand(), TestCommand).toJSON()).toEqual({
        name: "test",
        description: "test",
        description_localizations: {},
        type: ApplicationCommandType.ChatInput,
        options: [
          {
            name: "test",
            description: "test",
            description_localizations: {},
            type: ApplicationCommandOptionType.String,
            required: true,
          },
        ],
      });
    });
  });
}
