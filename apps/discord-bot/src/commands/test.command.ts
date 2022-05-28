import { ApiService } from '#services';
import { Command } from '@statsify/discord';

@Command({ description: 'Hello' })
export class TestCommand {
  public constructor(private readonly apiService: ApiService) {}

  public run() {
    const ranks = ['§b[MVP§8+§b] j4cobi', '§b[MVP§8++§b] j4cobi', '§c[§fYOUTUBE§c] Manhal_IQ_'];

    return {
      content: ranks.map((rank) => `${this.apiService.emojiDisplayName(rank)}`).join('\n'),
    };
  }
}
