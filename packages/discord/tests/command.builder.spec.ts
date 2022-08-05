/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AbstractArgument, Command, CommandBuilder, SubCommand } from "../src";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "discord-api-types/v10";

describe("CommandBuilder", () => {
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
