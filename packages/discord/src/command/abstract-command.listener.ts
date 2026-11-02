/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as Sentry from "@sentry/node";
import {
  type APIUser,
  ApplicationCommandOptionType,
  GatewayDispatchEvents,
  InteractionResponseType,
} from "discord-api-types/v10";
import { CommandContext } from "./command.context.js";
import { ErrorMessage } from "#util/error.message";
import { type IMessage, Message } from "#messages";
import { type CustomId, Interaction, type InteractionAttachment, parseCustomId } from "#interaction";
import { Logger } from "@statsify/logger";
import { User, UserTier } from "@statsify/schemas";
import { getAssetPath, getLogoPath } from "@statsify/assets";
import { readFileSync } from "node:fs";
import type { CommandResolvable } from "./command.resolvable.js";
import type {
  InteractionServer,
  RestClient,
  WebsocketShard,
} from "tiny-discord";

export type InteractionHook = (
  interaction: Interaction
) => InteractionServer.InteractionReply | undefined | Promise<any>;

/** Handles every custom id that starts with its route, made with createCustomId */
export type ComponentRoute = (
  interaction: Interaction,
  customId: CustomId
) => ReturnType<InteractionHook>;

export type CommandPrecondition = () => void;

export interface ExecuteCommandOptions {
  commandName: string;
  command: CommandResolvable;
  context: CommandContext;
  preconditions?: CommandPrecondition[];
  message?: IMessage | Message;
}

const RERUN_CACHE_SIZE = 50;
const RERUN_CACHE_TTL = 300_000;

interface RerunCacheEntry {
  message: IMessage | Message;
  locale: string;
  expiresAt: number;
}

export abstract class AbstractCommandListener {
  protected hooks: Map<string, InteractionHook>;
  protected routes = new Map<string, ComponentRoute>();
  private rerunCache = new Map<string, RerunCacheEntry>();
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

  public addRoute(route: string, handler: ComponentRoute) {
    this.routes.set(route, handler);
  }

  /**
   * Runs a command again for a button, select menu or modal on its reply, as the user who
   * ran it. Their message is edited; anyone else gets the reply as a preview only they see
   */
  public async rerunCommand(
    interaction: Interaction,
    ownerId: string,
    path: string[],
    options: Record<string, string>
  ) {
    const command = this.findCommand(path);
    if (!command) return;

    const isOwner = interaction.getUserId() === ownerId;

    // Modal input isn't part of the key, so only button and select replies are cached
    const cacheKey = interaction.isMessageComponentInteraction() ?
      [interaction.getCustomId(), interaction.getData().values?.[0], interaction.getLocale()].join("|") :
      undefined;

    try {
      const cached = cacheKey ? this.rerunCache.get(cacheKey) : undefined;
      let message: IMessage | Message;

      if (cached && cached.expiresAt > Date.now()) {
        message = cached.message;
        interaction.setLocale(cached.locale);
      } else {
        const data = {
          name: path.at(-1),
          options: Object.entries(options).map(([name, value]) => ({
            name,
            value,
            type: ApplicationCommandOptionType.String,
          })),
        };

        const context = new CommandContext(this, interaction, data);
        context.setUser(await this.getUser(ownerId));

        message = await command.execute(context);

        // A preview's buttons are made with the clicker's id, so only the owner's reply is kept
        if (cacheKey && isOwner && !message.ephemeral)
          this.cacheRerun(cacheKey, message, interaction.getLocale());
      }

      if (isOwner && !message.ephemeral) return await interaction.editReply(message);

      return await interaction.sendFollowup({ ...message, components: [], ephemeral: true });
    } catch (err) {
      if (err instanceof Message) return interaction.sendFollowup({ ...err, ephemeral: true });

      this.logger.error(`An error occurred when re-running "${path.join(" ")}"`);
      this.logger.error(err);
    }
  }

  public listen() {
    if (this.port !== undefined) {
      this.logger.log(`Listening with InteractionServer on port ${this.port}`);
      return (this.client as InteractionServer).listen(this.port as number);
    }

    this.logger.log("Connecting to gateway with WebsocketShard");
    return (this.client as WebsocketShard).connect();
  }

  protected getCommandAndData(
    command: CommandResolvable,
    data: any,
    name = command.name
  ): [command: CommandResolvable, data: any, name: string] {
    if (!data.options || data.options.length === 0) return [command, data, name];

    const firstOption = data.options[0];

    const hasSubCommandGroup = firstOption.type === ApplicationCommandOptionType.SubcommandGroup;
    const findCommand = () => command.options?.find((opt) => opt.name === firstOption.name);

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

  protected async executeCommand({
    commandName,
    command,
    context,
    preconditions = [],
    message,
  }: ExecuteCommandOptions) {
    const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();

    try {
      for (const precondition of preconditions) {
        precondition();
      }

      const response = await command.execute(context);

      if (typeof response !== "object") return;
      transaction?.finish();

      context.reply({
        ...message,
        ...response,
      });
    } catch (err) {
      if (err instanceof Message) {
        transaction?.finish();
        return context.reply(err);
      }

      this.logger.error(`An error occurred when running "${commandName}"`);
      this.logger.error(err);
      transaction?.finish();
    }
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

      const hasPreview = Boolean(command.preview);

      const tierError = new ErrorMessage(
        (t) => t(`errors.${tierName}Only.title`),
        (t) => t(`errors.${tierName}Only.${hasPreview ? "preview" : "description"}`),
        { color, thumbnail }
      );

      if (hasPreview) {
        const preview = {
          name: "preview.png",
          data: readFileSync(getAssetPath(`previews/${command.preview}`)),
          type: "image/png",
        };

        tierError.files?.push(preview);
        tierError.embeds?.[0]?.image(`attachment://${preview.name}`);
      }

      throw tierError;
    }
  }

  protected onMessageComponent(interaction: Interaction): InteractionServer.InteractionReply {
    const customId = interaction.getCustomId();
    const hook = this.hooks.get(customId);
    const parsed = parseCustomId(customId);

    const res = hook ? hook(interaction) : this.routes.get(parsed.route)?.(interaction, parsed);

    if (res && !(res instanceof Promise)) return res;

    return { type: InteractionResponseType.DeferredMessageUpdate };
  }

  protected onModal(interaction: Interaction): InteractionServer.InteractionReply {
    // Currently the message component handler is the same implementation as the modal handler
    return this.onMessageComponent(interaction);
  }

  protected async onAutocomplete(interaction: Interaction): Promise<InteractionServer.InteractionReply> {
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

  private cacheRerun(key: string, message: IMessage | Message, locale: string) {
    if (this.rerunCache.size >= RERUN_CACHE_SIZE) {
      const [oldest] = this.rerunCache.keys();
      this.rerunCache.delete(oldest);
    }

    this.rerunCache.set(key, { message, locale, expiresAt: Date.now() + RERUN_CACHE_TTL });
  }

  /** Subcommand names are unique within a command, so groups stay out of the path */
  private findCommand([name, ...subcommands]: string[]) {
    let command = this.commands.get(name);

    for (const subcommand of subcommands) {
      command = command?.options
        ?.flatMap((option) =>
          option.type === ApplicationCommandOptionType.SubcommandGroup ? option.options : option
        )
        .find((option) => option.name === subcommand);
    }

    return command;
  }

  private async onInteraction(interaction: Interaction): Promise<InteractionServer.InteractionReply> {
    if (interaction.isCommandInteraction()) {
      this.onCommand(interaction);
      return { type: InteractionResponseType.DeferredChannelMessageWithSource };
    }

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

    client.on("interaction", async (event) => {
      const interaction = new Interaction(this.rest, event.interaction, this.applicationId);
      const response = await this.onInteraction(interaction);
      await interaction.reply(response);

      event.response.statusCode = 204;
      event.response.end();
    });
  }

  private handleWebsocketShard(client: WebsocketShard) {
    client.on("ready", (event) => {
      if (event.type === "resume") return;
      const data = event.data as WebsocketShard.ShardReady;
      const user = data.user as APIUser;

      this.logger.log(
        `Connected to gateway with WebsocketShard on ${user.username}`
      );
    });

    client.on("event", async (event) => {
      if (event.t !== GatewayDispatchEvents.InteractionCreate) return;

      const interaction = new Interaction(
        this.rest,
        event.d as InteractionServer.InteractionData,
        this.applicationId
      );

      const response = await this.onInteraction(interaction);
      interaction.reply(response);
    });
  }

  protected abstract onCommand(interaction: Interaction): Promise<void> | void;

  protected abstract getUser(id: string): Promise<User | null>;
}
