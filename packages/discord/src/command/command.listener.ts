import { Logger } from '@statsify/logger';
import { APIUser, GatewayDispatchEvents, InteractionResponseType } from 'discord-api-types/v10';
import EventEmitter from 'events';
import type { InteractionServer, WebsocketShard } from 'tiny-discord';

export class CommandListener extends EventEmitter {
  private readonly logger = new Logger('CommandListener');

  public constructor(client: InteractionServer, port: number);
  public constructor(client: WebsocketShard);
  public constructor(private client: WebsocketShard | InteractionServer, private port?: number) {
    super();

    if (port) {
      this.handleInteractionServer(this.client as InteractionServer);
    } else {
      this.handleWebsocketShard(this.client as WebsocketShard);
    }
  }

  public listen() {
    if (typeof this.port === 'number') {
      this.logger.log(`Listenening with InteractionServer on port ${this.port}`);
      return (this.client as InteractionServer).listen(this.port);
    }

    this.logger.log(`Connecting to gateway with WebsocketShard`);
    return (this.client as WebsocketShard).connect();
  }

  private handleInteractionServer(client: InteractionServer) {
    client.on('error', (err) => {
      this.logger.error(err);
    });

    client.on('interaction', (interaction) => {
      this.emit('interaction', interaction);

      return {
        type: InteractionResponseType.DeferredChannelMessageWithSource,
      };
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
      this.emit('interaction', event.d);
    });
  }
}
