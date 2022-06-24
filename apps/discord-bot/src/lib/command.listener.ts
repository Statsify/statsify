/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Container from "typedi";
import {
  AbstractCommandListener,
  CommandContext,
  CommandResolvable,
  Interaction,
} from "@statsify/discord";
import { ApiService } from "#services";
import { ErrorMessage } from "#lib/error.message";
import { InteractionResponseType } from "discord-api-types/v10";
import { User, UserTier } from "@statsify/schemas";
import { WARNING_COLOR } from "#constants";
import { env, formatTime } from "@statsify/util";
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
      env("DISCORD_BOT_APPLICATION_ID"),
      env("DISCORD_BOT_PORT", { required: false })!
    );

    this.apiService = Container.get(ApiService);
    this.cooldowns = new Map();
  }

  protected async onCommand(interaction: Interaction): Promise<InteractionResponse> {
    let data = interaction.getData();
    let command = this.commands.get(data.name)!;

    if (!command) return { type: InteractionResponseType.Pong };

    const userId = interaction.getUserId();

    [command, data] = this.getCommandAndData(command, data);

    const user = await this.apiService.getUser(userId);

    const context = new CommandContext(this, interaction, data);
    context.setUser(user);

    return this.executeCommand(
      command,
      context,
      this.isOnCooldown.bind(this, command, user, userId)
    );
  }

  private isOnCooldown(command: CommandResolvable, user: User | null, userId: string) {
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
      { color: WARNING_COLOR }
    );
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
