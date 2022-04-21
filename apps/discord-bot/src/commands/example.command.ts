import { Command } from '@statsify/discord';
import { ApiService } from '../services/api.service';

@Command({ description: 'Page command' })
export class ExampleCommand {
  public constructor(private readonly apiService: ApiService) {}

  public async run() {
    const player = await this.apiService.getPlayer('j4cobi');

    return { content: `Hello ${player.username}` };
  }
}
