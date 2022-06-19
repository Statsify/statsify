/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  APIUser,
  ApplicationCommandOptionType,
  GatewayDispatchEvents,
  InteractionResponseType,
} from "discord-api-types/v10";
import { CommandResolvable } from "./command.resolvable";
import { Interaction } from "../interaction";
import { Logger } from "@statsify/logger";
import type {
  Interaction as DiscordInteraction,
  InteractionResponse,
  InteractionServer,
  RestClient,
  WebsocketShard,
} from "tiny-discord";

export type InteractionHook = (
  interaction: Interaction
) => InteractionResponse | void | Promise<any>;

export abstract class AbstractCommandListener {
  protected hooks: Map<string, InteractionHook>;
  protected readonly logger = new Logger("CommandListener");

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

  public addHook(id: string, hook: InteractionHook) {
    this.hooks.set(id, hook);
  }

  public removeHook(id: string) {
    this.hooks.delete(id);
  }

  public listen() {
    if (this.port !== undefined) {
      this.logger.log(`Listening with InteractionServer on port ${this.port}`);
      return (this.client as InteractionServer).listen(this.port as number);
    }

    this.logger.log(`Connecting to gateway with WebsocketShard`);
    return (this.client as WebsocketShard).connect();
  }

  public onInteraction(
    interaction: Interaction
  ): InteractionResponse | Promise<InteractionResponse> {
    if (interaction.isCommandInteraction()) return this.onCommand(interaction);
    if (interaction.isAutocompleteInteraction()) return this.onAutocomplete(interaction);
    if (interaction.isMessageComponentInteraction())
      return this.onMessageComponent(interaction);
    if (interaction.isModalInteraction()) return this.onModal(interaction);

    return { type: InteractionResponseType.Pong };
  }

  protected getCommandAndData(
    command: CommandResolvable,
    data: any
  ): [command: CommandResolvable, data: any] {
    if (!data.options || !data.options.length) return [command, data];

    const firstOption = data.options[0];

    const hasSubCommandGroup =
      firstOption.type === ApplicationCommandOptionType.SubcommandGroup;
    const findCommand = () =>
      command.options?.find((opt) => opt.name === firstOption.name);

    if (hasSubCommandGroup) {
      const group = findCommand();
      if (!group) return [command, data];
      return this.getCommandAndData(group, firstOption);
    }

    const hasSubCommand = firstOption.type === ApplicationCommandOptionType.Subcommand;

    if (hasSubCommand) {
      const subcommand = findCommand();
      if (!subcommand) return [command, data];
      return [subcommand, firstOption];
    }

    return [command, data];
  }

  protected onMessageComponent(interaction: Interaction): InteractionResponse {
    const hook = this.hooks.get(interaction.getCustomId());

    const res = hook?.(interaction);

    if (res && !(res instanceof Promise)) return res;

    return { type: InteractionResponseType.DeferredMessageUpdate };
  }

  protected onModal(interaction: Interaction): InteractionResponse {
    //Currently the message component handler is the same implementation as the modal handler
    return this.onMessageComponent(interaction);
  }

  private handleInteractionServer(client: InteractionServer) {
    client.on("error", (err) => {
      this.logger.error(err);
    });

    client.on("interaction", (_interaction) => {
      const interaction = new Interaction(this.rest, _interaction, this.applicationId);

      return this.onInteraction(interaction);
    });
  }

  private handleWebsocketShard(client: WebsocketShard) {
    client.on("ready", (data) => {
      this.logger.log(
        `Connected to gateway with WebsocketShard on ${(data.user as APIUser).username}`
      );
    });

    client.on("event", async (event) => {
      if (event.t !== GatewayDispatchEvents.InteractionCreate) return;

      const interaction = new Interaction(
        this.rest,
        event.d as DiscordInteraction,
        this.applicationId
      );

      interaction.reply(await this.onInteraction(interaction));
    });
  }

  protected abstract onCommand(interaction: Interaction): Promise<InteractionResponse>;
  protected abstract onAutocomplete(interaction: Interaction): InteractionResponse;
}
