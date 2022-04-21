import { Command, CommandContext } from '@statsify/discord';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import { ApiService } from '../services/api.service';

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
  public constructor(private readonly apiService: ApiService) {}

  public async run(context: CommandContext) {
    const tag = context.option<string>('message');

    const player = await this.apiService.getPlayer(tag);

    return { content: `Hello ${player.username}` };
  }
}
