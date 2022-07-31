/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as Sentry from "@sentry/node";
import {
  APIUser,
  ApplicationCommandOptionType,
  GatewayDispatchEvents,
  InteractionResponseType,
} from "discord-api-types/v10";
import { CommandContext } from "./command.context";
import { CommandResolvable } from "./command.resolvable";
import { ErrorMessage } from "../util/error.message";
import { Interaction, InteractionAttachment } from "../interaction";
import { Logger } from "@statsify/logger";
import { Message } from "../messages";
import { User, UserTier } from "@statsify/schemas";
import { getLogoPath } from "@statsify/assets";
import { readFileSync } from "node:fs";
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

export type CommandPrecondition = () => void;

export interface ExecuteCommandOptions {
  commandName: string;
  command: CommandResolvable;
  context: CommandContext;
  preconditions?: CommandPrecondition[];
  response?: InteractionResponse;
}

export abstract class AbstractCommandListener {
  protected hooks: Map<string, InteractionHook>;
  protected readonly logger = new Logger("CommandListener");

  protected constructor(
    client: InteractionServer,
    rest: RestClient,
    commands: Map<string, CommandResolvable>,
    applicationId: string,
    port: number
  );
  protected constructor(
    client: WebsocketShard,
    rest: RestClient,
    commands: Map<string, CommandResolvable>,
    applicationId: string
  );
  protected constructor(
    private client: WebsocketShard | InteractionServer,
    private rest: RestClient,
    protected commands: Map<string, CommandResolvable>,
    private applicationId: string,
    private port?: number
  ) {
    this.hooks = new Map();

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

  protected getCommandAndData(
    command: CommandResolvable,
    data: any,
    name = command.name
  ): [command: CommandResolvable, data: any, name: string] {
    if (!data.options || !data.options.length) return [command, data, name];

    const firstOption = data.options[0];

    const hasSubCommandGroup =
      firstOption.type === ApplicationCommandOptionType.SubcommandGroup;
    const findCommand = () =>
      command.options?.find((opt) => opt.name === firstOption.name);

    if (hasSubCommandGroup) {
      const group = findCommand();
      if (!group) return [command, data, name];
      return this.getCommandAndData(group, firstOption, `${name} ${group.name}`);
    }

    const hasSubCommand = firstOption.type === ApplicationCommandOptionType.Subcommand;

    if (hasSubCommand) {
      const subcommand = findCommand();
      if (!subcommand) return [command, data, name];
      return [subcommand, firstOption, `${name} ${subcommand.name}`];
    }

    return [command, data, name];
  }

  protected executeCommand({
    commandName,
    command,
    context,
    preconditions = [],
    response = { type: InteractionResponseType.DeferredChannelMessageWithSource },
  }: ExecuteCommandOptions): InteractionResponse {
    const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();

    try {
      preconditions.forEach((precondition) => precondition());

      const response = command.execute(context);

      if (response instanceof Promise)
        response
          .then((res) => {
            if (typeof res !== "object") return;
            transaction?.finish();
            context.reply(res);
          })
          .catch((err) => {
            if (err instanceof Message) {
              transaction?.finish();
              return context.reply(err);
            }

            this.logger.error(`An error occurred when running "${commandName}"`);
            this.logger.error(err);
            transaction?.finish();
          });
      else if (typeof response === "object") {
        transaction?.finish();
        return {
          type: InteractionResponseType.ChannelMessageWithSource,
          data: context.getInteraction().convertToApiData(response),
        };
      }
    } catch (err) {
      if (err instanceof Message) {
        transaction?.finish();

        const data = context.getInteraction().convertToApiData(err);

        if ("payload_json" in data) {
          return {
            //@ts-ignore tiny-discord types are not fully updated yet
            files: data.files,
            payload_json: {
              type: InteractionResponseType.ChannelMessageWithSource,
              data: data.payload_json,
            },
          };
        }

        return {
          type: InteractionResponseType.ChannelMessageWithSource,
          data,
        };
      }

      this.logger.error(`An error occurred when running "${commandName}"`);
      this.logger.error(err);
      transaction?.finish();
    }

    return response;
  }

  protected tierPrecondition(command: CommandResolvable, user: User | null) {
    if (!command.tier) return;
    if (!user) throw new ErrorMessage("errors.missingSelfVerification");

    if ((user.tier ?? UserTier.NONE) < command.tier) {
      const tierName = User.getTierName(command.tier).toLowerCase();
      let color = 0xb5b5b5;

      const thumbnail: InteractionAttachment = {
        name: "logo.png",
        data: readFileSync(getLogoPath(User.tierToLogo(command.tier), 52)),
        type: "image/png",
      };

      switch (command.tier) {
        case UserTier.IRON:
          color = 0xb5b5b5;
          break;
        case UserTier.GOLD:
          color = 0xe7aa13;
          break;
        case UserTier.DIAMOND:
          color = 0x1abaa7;
          break;
        case UserTier.EMERALD:
          color = 0x009b24;
          break;
        case UserTier.NETHERITE:
          color = 0x565456;
          break;
        case UserTier.STAFF:
          color = 0x7a58c3;
          break;
        case UserTier.CORE:
          color = 0xd22140;
          break;
      }

      const tierError = new ErrorMessage(
        (t) => t(`errors.${tierName}Only.title`),
        (t) => t(`errors.${tierName}Only.description`),
        { color, thumbnail }
      );

      throw tierError;
    }
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

  protected async onAutocomplete(interaction: Interaction): Promise<InteractionResponse> {
    const defaultResponse = {
      type: InteractionResponseType.ApplicationCommandAutocompleteResult,
      data: { choices: [] },
    };

    let data = interaction.getData();

    let command = this.commands.get(data.name);

    if (!command) return defaultResponse;

    [command, data] = this.getCommandAndData(command, data);

    const focusedOption = data.options.find((opt: any) => opt.focused);
    if (!focusedOption) return defaultResponse;

    const autocompleteArg = command.args.find((opt) => opt.name === focusedOption.name);
    if (!autocompleteArg) return defaultResponse;

    const context = new CommandContext(this, interaction, data);
    const response = await autocompleteArg.autocompleteHandler?.(context);

    return {
      type: InteractionResponseType.ApplicationCommandAutocompleteResult,
      data: { choices: response },
    };
  }

  private onInteraction(
    interaction: Interaction
  ): InteractionResponse | Promise<InteractionResponse> {
    if (interaction.isCommandInteraction()) return this.onCommand(interaction);
    if (interaction.isAutocompleteInteraction()) return this.onAutocomplete(interaction);
    if (interaction.isMessageComponentInteraction())
      return this.onMessageComponent(interaction);
    if (interaction.isModalInteraction()) return this.onModal(interaction);

    return { type: InteractionResponseType.Pong };
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
}
