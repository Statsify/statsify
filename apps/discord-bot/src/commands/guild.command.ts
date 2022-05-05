import { GuildQuery } from '@statsify/api-client';
import { Command, CommandContext } from '@statsify/discord';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import { ApiService } from '../services/api.service';

@Command({
  description: 'Guild',
  args: [
    {
      name: 'query',
      description: 'The guild',
      required: false,
      type: ApplicationCommandOptionType.String,
    },
    {
      name: 'type',
      description: 'The type of guild',
      required: false,
      type: ApplicationCommandOptionType.String,
      choices: [
        { name: 'name', value: GuildQuery.NAME },
        { name: 'id', value: GuildQuery.ID },
        { name: 'player', value: GuildQuery.PLAYER },
      ],
    },
  ],
})
export class GuildCommand {
  public constructor(private readonly apiService: ApiService) {}

  public async run(context: CommandContext) {
    const guild = await this.apiService.getGuild(
      context.option<string>('query'),
      context.option<GuildQuery>('type'),
      context.user
    );

    return {
      content: `${guild.name} (${guild.tag})`,
    };
  }
}
