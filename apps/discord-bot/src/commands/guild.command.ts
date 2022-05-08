import { GuildQuery } from '@statsify/api-client';
import { Command, CommandContext } from '@statsify/discord';
import { GuildArgument } from '../arguments';
import { ApiService } from '../services/api.service';

@Command({
  description: 'Guild',
  args: GuildArgument,
})
export class GuildCommand {
  public constructor(private readonly apiService: ApiService) {}

  public async run(context: CommandContext) {
    const guild = await this.apiService.getGuild(
      context.option<string>('query'),
      context.option<GuildQuery>('type'),
      context.getUser()
    );

    return {
      content: `${guild.name} (${guild.tag})`,
    };
  }
}
