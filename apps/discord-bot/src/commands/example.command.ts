import { Command, CommandContext, EmbedBuilder } from '@statsify/discord';
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
    const embed = new EmbedBuilder()
      .title('Example Command')
      .description(context.option('message'))
      .build();

    return { embeds: [embed] };
  }
}
