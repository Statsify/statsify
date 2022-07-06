/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as Sentry from "@sentry/node";
import Container from "typedi";
import {
  AbstractCommandListener,
  ApiService,
  CommandContext,
  CommandResolvable,
  ErrorMessage,
  Interaction,
} from "@statsify/discord";
import { InteractionResponseType } from "discord-api-types/v10";
import { STATUS_COLORS } from "@statsify/logger";
import { User, UserTier } from "@statsify/schemas";
import { config, formatTime } from "@statsify/util";
import { tips } from "../tips";
import type {
  InteractionResponse,
  InteractionServer,
  RestClient,
  WebsocketShard,
} from "tiny-discord";

export class CommandListener extends AbstractCommandListener {
  private cooldowns: Map<string, Map<string, number>>;
  private readonly apiService: ApiService;
  private static instance: CommandListener;

  private constructor(
    client: WebsocketShard | InteractionServer,
    rest: RestClient,
    commands: Map<string, CommandResolvable>
  ) {
    super(
      client as InteractionServer,
      rest,
      commands,
      config("discordBot.applicationId"),
      config("discordBot.port", { required: false })!
    );

    this.apiService = Container.get(ApiService);
    this.cooldowns = new Map();
  }

  protected async onCommand(interaction: Interaction): Promise<InteractionResponse> {
    const parentData = interaction.getData();
    const parentCommand = this.commands.get(parentData.name)!;

    if (!parentCommand) return { type: InteractionResponseType.Pong };

    const { id, username, discriminator } = interaction.getUser();
    const locale = interaction.getLocale();

    const [command, data, commandName] = this.getCommandAndData(
      parentCommand,
      parentData
    );

    const transaction = Sentry.startTransaction({ name: commandName, op: "command" });

    Sentry.configureScope((scope) => scope.setSpan(transaction));

    Sentry.setContext("command", {
      command: commandName,
      options: data.options,
      guild: interaction.getGuildId() ?? null,
    });

    const user = await this.apiService.getUser(id);

    Sentry.setUser({
      id,
      username: `${username}#${discriminator}`,
      locale,
      uuid: user?.uuid ?? null,
      tier: user?.tier ?? UserTier.NONE,
      serverMember: user?.serverMember ?? false,
      theme: user?.theme ?? null,
    });

    const context = new CommandContext(this, interaction, data);
    context.setUser(user);

    const preconditions = [
      this.tierPrecondition.bind(this, command, user),
      this.cooldownPrecondition.bind(this, command, user, id),
    ];

    this.apiService.incrementCommand(commandName);

    return this.executeCommand({
      commandName,
      command,
      context,
      preconditions,
      response: this.getTipResponse(commandName, user, interaction),
    });
  }

  private cooldownPrecondition(
    command: CommandResolvable,
    user: User | null,
    userId: string
  ) {
    const cooldownForCommand = this.cooldowns.get(command.name);

    let reduction = 1;

    if (user?.tier === UserTier.CORE) reduction = 0;
    else if (user?.tier === UserTier.PREMIUM) reduction = 0.3;
    else if (user?.serverMember) reduction = 0.8;
    else if (user?.uuid) reduction = 0.9;

    const now = Date.now();
    const newCooldown = now + command.cooldown * 1000 * reduction;

    if (!cooldownForCommand) {
      const cooldownForCommand = new Map();
      cooldownForCommand.set(userId, newCooldown);
      this.cooldowns.set(command.name, cooldownForCommand);

      return;
    }

    const cooldown = cooldownForCommand.get(userId);

    if (!cooldown) {
      cooldownForCommand.set(userId, newCooldown);
      return;
    }

    if (now >= cooldown) {
      cooldownForCommand.set(userId, newCooldown);
      return;
    }

    throw new ErrorMessage(
      (t) => t("cooldown.title"),
      (t) =>
        t("cooldown.description", {
          time: formatTime(cooldown - now),
          command: command.name,
        }),
      { color: STATUS_COLORS.warn }
    );
  }

  private getTipResponse(
    commandName: string,
    user: User | null,
    interaction: Interaction
  ): InteractionResponse {
    const TIP_CHANCE = 0.2;

    const defaultResponse = {
      type: InteractionResponseType.DeferredChannelMessageWithSource,
    };

    if (User.isPremium(user)) return defaultResponse;

    if (Math.random() > TIP_CHANCE) return defaultResponse;

    const useableTips = tips.filter(
      (t) => !t.disabled?.includes(commandName) && !t.uneligible?.(user)
    );

    if (!useableTips.length) return defaultResponse;

    const tip = useableTips[Math.floor(Math.random() * useableTips.length)];

    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: interaction.convertToApiData(tip.message),
    };
  }

  public static create(
    client: WebsocketShard | InteractionServer,
    rest: RestClient,
    commands: Map<string, CommandResolvable>
  ) {
    this.instance = new CommandListener(client, rest, commands);
    return this.instance;
  }

  public static getInstance() {
    if (!this.instance) throw new Error("CommandListener has not been initialized");
    return this.instance;
  }
}
