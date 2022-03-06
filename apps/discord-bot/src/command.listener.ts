import { AbstractCommandListener, Interaction } from '@statsify/discord';
import { InteractionResponseType } from 'discord-api-types/v10';
import type {
  InteractionResponse,
  InteractionServer,
  RestClient,
  WebsocketShard,
} from 'tiny-discord';

export class CommandListener extends AbstractCommandListener {
  public constructor(client: WebsocketShard | InteractionServer, rest: RestClient) {
    super(
      client as InteractionServer,
      rest,
      process.env.DISCORD_BOT_APPLICATION_ID,
      process.env.DISCORD_BOT_PORT as number
    );
  }

  public onInteraction(interaction: Interaction): InteractionResponse {
    if (interaction.isPingInteraction()) return { type: InteractionResponseType.Pong };
    if (interaction.isMessageComponentInteraction())
      return { type: InteractionResponseType.DeferredMessageUpdate };
    if (interaction.isCommandInteraction())
      return { type: InteractionResponseType.DeferredChannelMessageWithSource };

    return { type: InteractionResponseType.Pong };
  }
}
