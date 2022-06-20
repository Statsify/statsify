/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
import { AbstractArgument, Command, CommandBuilder, SubCommand } from '../src';

describe('CommandBuilder', () => {
  it('should read basic metadata', () => {
    @Command({ description: 'test' })
    class TestCommand {}

    expect(CommandBuilder.scan(new TestCommand(), TestCommand).toJSON()).toEqual({
      name: 'test',
      description: 'test',
      description_localizations: {},
      type: ApplicationCommandType.ChatInput,
      options: [],
    });
  });

  it('should read subcommands', () => {
    @Command({ description: 'test' })
    class TestCommand {
      @SubCommand({ description: 'test' })
      public subcommand() {
        //
      }
    }

    expect(CommandBuilder.scan(new TestCommand(), TestCommand).toJSON()).toEqual({
      name: 'test',
      description: 'test',
      description_localizations: {},
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          name: 'subcommand',
          description: 'test',
          description_localizations: {},
          type: ApplicationCommandOptionType.Subcommand,
          options: [],
        },
      ],
    });
  });

  it('should read groups', () => {
    @Command({ description: 'test' })
    class GroupCommand {}

    @Command({ description: 'test', groups: [GroupCommand] })
    class TestCommand {}

    expect(CommandBuilder.scan(new TestCommand(), TestCommand).toJSON()).toEqual({
      name: 'test',
      description: 'test',
      type: ApplicationCommandType.ChatInput,
      description_localizations: {},
      options: [
        {
          name: 'group',
          description: 'test',
          description_localizations: {},
          type: ApplicationCommandOptionType.SubcommandGroup,
          options: [],
        },
      ],
    });
  });

  it('should read groups with subcommands', () => {
    @Command({ description: 'test' })
    class GroupCommand {
      @SubCommand({ description: 'test' })
      public subcommand() {
        //
      }
    }

    @Command({ description: 'test', groups: [GroupCommand] })
    class TestCommand {}

    expect(CommandBuilder.scan(new TestCommand(), TestCommand).toJSON()).toEqual({
      name: 'test',
      description: 'test',
      description_localizations: {},
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          name: 'group',
          description: 'test',
          description_localizations: {},
          type: ApplicationCommandOptionType.SubcommandGroup,
          options: [
            {
              name: 'subcommand',
              description: 'test',
              description_localizations: {},
              type: ApplicationCommandOptionType.Subcommand,
              options: [],
            },
          ],
        },
      ],
    });
  });

  it('should read arguments', () => {
    class Arg extends AbstractArgument {
      public name = 'test';
      public description = 'test';
      public required = true;
      public type = ApplicationCommandOptionType.String;
    }

    @Command({ description: 'test', args: [Arg] })
    class TestCommand {}

    expect(CommandBuilder.scan(new TestCommand(), TestCommand).toJSON()).toEqual({
      name: 'test',
      description: 'test',
      description_localizations: {},
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          name: 'test',
          description: 'test',
          description_localizations: {},
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    });
  });
});
