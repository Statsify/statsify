import { Logger } from '@statsify/logger';
import type { RestClient } from 'tiny-discord';
import type { CommandResolvable } from './command.resolvable';

export class CommandPoster {
  private readonly logger = new Logger('CommandPoster');

  public constructor(private readonly client: RestClient) {}

  public async post(
    commands: Map<string, CommandResolvable>,
    applicationId: string,
    guildId?: string
  ) {
    const commandsToPost = Array.from(commands.values());

    const res = await this.client.put(
      `/applications/${applicationId}${guildId ? `/guilds/${guildId}` : ''}/commands`,
      commandsToPost
    );

    if (res.status !== 200) {
      this.logger.error(`Failed to post commands: ${res.status}`);
    } else {
      this.logger.log(`Successfully posted ${commandsToPost.length} commands`);
    }
  }
}
