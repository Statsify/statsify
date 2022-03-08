import { Logger } from '@statsify/logger';
import { APIUser, GatewayDispatchEvents } from 'discord-api-types/v10';
import type {
  Interaction as DiscordInteraction,
  InteractionResponse,
  InteractionServer,
  RestClient,
  WebsocketShard,
} from 'tiny-discord';
import { Interaction } from '../interaction';

export abstract class AbstractCommandListener {
  private readonly logger = new Logger('CommandListener');

  public constructor(
    client: InteractionServer,
    rest: RestClient,
    applicationId: string,
    port: number
  );
  public constructor(client: WebsocketShard, rest: RestClient, applicationId: string);
  public constructor(
    private client: WebsocketShard | InteractionServer,
    private rest: RestClient,
    private applicationId: string,
    private port?: number
  ) {
    if (port) {
      this.handleInteractionServer(this.client as InteractionServer);
    } else {
      this.handleWebsocketShard(this.client as WebsocketShard);
    }
  }

  public listen() {
    if (this.port !== undefined) {
      this.logger.log(`Listening with InteractionServer on port ${this.port}`);
      return (this.client as InteractionServer).listen(this.port as number);
    }

    this.logger.log(`Connecting to gateway with WebsocketShard`);
    return (this.client as WebsocketShard).connect();
  }

  private handleInteractionServer(client: InteractionServer) {
    client.on('error', (err) => {
      this.logger.error(err);
    });

    client.on('interaction', (_interaction) => {
      const interaction = new Interaction(this.rest, _interaction, this.applicationId);

      return this.onInteraction(interaction);
    });
  }

  private handleWebsocketShard(client: WebsocketShard) {
    client.on('ready', (data) => {
      this.logger.log(
        `Connected to gateway with WebsocketShard on ${(data.user as APIUser).username}`
      );
    });

    client.on('event', (event) => {
      if (event.t !== GatewayDispatchEvents.InteractionCreate) return;

      const interaction = new Interaction(
        this.rest,
        event.d as DiscordInteraction,
        this.applicationId
      );

      interaction.reply(this.onInteraction(interaction));
    });
  }

  public abstract onInteraction(interaction: Interaction): InteractionResponse;
}
