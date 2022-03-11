import { Command, CommandContext } from '@statsify/discord';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import { ExampleService } from '../services/example.service';

@Command({
  description: 'Displays this message.',
  args: [
    {
      name: 'message',
      description: 'The message to display.',
      required: true,
      type: ApplicationCommandOptionType.String,
    },
  ],
  cooldown: 5,
})
export class ExampleCommand {
  public constructor(private readonly exampleService: ExampleService) {}

  public run(context: CommandContext) {
    return {
      embeds: [
        {
          title: 'Example',
          description: context.option('message'),
        },
      ],
      ephemeral: true,
    };
  }
}
