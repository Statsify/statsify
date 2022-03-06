import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
import { Argument, Command, CommandBuilder, SubCommand } from '../src';

describe('CommandBuilder', () => {
  it('should read basic metadata', () => {
    @Command({ description: 'test' })
    class TestCommand {}

    expect(CommandBuilder.scan(new TestCommand())).toEqual({
      name: 'test',
      description: 'test',
      type: ApplicationCommandType.ChatInput,
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

    expect(CommandBuilder.scan(new TestCommand())).toEqual({
      name: 'test',
      description: 'test',
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          name: 'subcommand',
          description: 'test',
          type: ApplicationCommandOptionType.Subcommand,
        },
      ],
    });
  });

  it('should read groups', () => {
    @Command({ description: 'test' })
    class GroupCommand {}

    @Command({ description: 'test', groups: [GroupCommand] })
    class TestCommand {}

    expect(CommandBuilder.scan(new TestCommand())).toEqual({
      name: 'test',
      description: 'test',
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          name: 'group',
          description: 'test',
          type: ApplicationCommandOptionType.SubcommandGroup,
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

    expect(CommandBuilder.scan(new TestCommand())).toEqual({
      name: 'test',
      description: 'test',
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          name: 'group',
          description: 'test',
          type: ApplicationCommandOptionType.SubcommandGroup,
          options: [
            {
              name: 'subcommand',
              description: 'test',
              type: ApplicationCommandOptionType.Subcommand,
            },
          ],
        },
      ],
    });
  });

  it('should read arguments', () => {
    const arg: Argument = {
      name: 'test',
      description: 'test',
      required: true,
      type: ApplicationCommandOptionType.String,
    };

    @Command({ description: 'test', args: [arg] })
    class TestCommand {}

    expect(CommandBuilder.scan(new TestCommand())).toEqual({
      name: 'test',
      description: 'test',
      type: ApplicationCommandType.ChatInput,
      options: [arg],
    });
  });
});
