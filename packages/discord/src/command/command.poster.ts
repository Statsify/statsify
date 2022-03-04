import type { RestClient } from 'tiny-discord';
import type { CommandResolvable } from './command.resolvable';

export class CommandPoster {
  public constructor(private readonly client: RestClient) {}

  public async post(
    commands: Map<string, CommandResolvable>,
    applicationId: string,
    guildId?: string
  ) {
    const commandsToPost = Array.from(commands.values());

    await this.client.put(
      `/applications/${applicationId}${guildId ? `/guilds/${guildId}` : ''}/commands`,
      commandsToPost
    );
  }
}
