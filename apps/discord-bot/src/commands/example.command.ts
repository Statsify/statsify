import { Command, CommandContext } from '@statsify/discord';
import { ApiService } from '../services/api.service';

@Command({ description: 'Page command' })
export class ExampleCommand {
  public constructor(private readonly apiService: ApiService) {}

  public async run(context: CommandContext) {
    const tag = context.option<string>('message');

    const player = await this.apiService.getPlayer(tag);

    return { content: `Hello ${player.username}` };
  }
}
