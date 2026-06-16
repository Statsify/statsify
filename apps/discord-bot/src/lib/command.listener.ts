/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as Sentry from "@sentry/node";
import {
  AbstractCommandListener,
  ApiService,
  CommandContext,
  CommandResolvable,
  ErrorMessage,
  Interaction,
} from "@statsify/discord";
import { Container } from "typedi";
import { PosthogService } from "../posthog.js";
import { STATUS_COLORS } from "@statsify/logger";
import { User, UserTier } from "@statsify/schemas";
import { config, formatTime } from "@statsify/util";
import { getAssetPath } from "@statsify/assets";
import { readFileSync } from "node:fs";
import { Tip, tips } from "../tips.js";
import type { InteractionServer, RestClient, WebsocketShard } from "tiny-discord";

const isDevelopment = await config("environment") === "dev";
const applicationId = await config("discordBot.applicationId");
const port = await config("discordBot.port", { required: false });

export class CommandListener extends AbstractCommandListener {
  private cooldowns: Map<string, Map<string, number>>;
  private readonly apiService: ApiService;
  private readonly posthogService: PosthogService;
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
      applicationId,
      port!
    );

    this.apiService = Container.get(ApiService);
    this.posthogService = Container.get(PosthogService);
    this.cooldowns = new Map();
  }

  protected async onCommand(interaction: Interaction): Promise<void> {
    const parentData = interaction.getData();
    const parentCommand = this.commands.get(parentData.name)!;

    if (!parentCommand) return;

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

    const guildId = interaction.getGuildId() ?? null;

    const preconditions = [
      () => {
        try {
          this.tierPrecondition(command, user);
        } catch (err) {
          this.posthogService.captureNoProfile({
            distinctId: id,
            event: "tier gate hit",
            properties: {
              command: commandName,
              required_tier: command.tier,
              user_tier: user?.tier ?? UserTier.NONE,
              guild_id: guildId,
            },
          });
          throw err;
        }
      },
      () => {
        try {
          this.cooldownPrecondition(parentCommand, user, id);
        } catch (err) {
          this.posthogService.captureNoProfile({
            distinctId: id,
            event: "cooldown hit",
            properties: {
              command: commandName,
              guild_id: guildId,
            },
          });
          throw err;
        }
      },
    ];

    this.apiService.incrementCommand(commandName);

    const tip = this.getTipResponse(commandName, user);

    if (tip) {
      this.posthogService.captureNoProfile({
        distinctId: id,
        event: "tip shown",
        properties: {
          tip: tip.name,
          command: commandName,
          guild_id: guildId,
        },
      });
    }

    return this.executeCommand({
      commandName,
      command,
      context,
      preconditions,
      message: tip?.message,
      onComplete: (result) => {
        this.posthogService.captureNoProfile({
          distinctId: id,
          event: "command executed",
          properties: {
            command: commandName,
            locale,
            tier: user?.tier ?? UserTier.NONE,
            serverMember: user?.serverMember ?? false,
            verified: !!user?.uuid,
            guild_id: guildId,
            ok: result.ok,
            error_kind: result.errorKind,
            duration_ms: result.durationMs,
          },
        });
      },
    });
  }

  private cooldownPrecondition(
    command: CommandResolvable,
    user: User | null,
    userId: string
  ) {
    if (isDevelopment) return true;

    const cooldownForCommand = this.cooldowns.get(command.name);

    let reduction = 1;

    if (User.isDiamond(user)) reduction = 0;
    else if (User.isGold(user)) reduction = 0.25;
    else if (User.isIron(user)) reduction = 0.5;
    else if (user?.serverMember) reduction = 0.8;
    else if (user?.uuid) reduction = 0.9;

    const now = Date.now();
    const newCooldown = now + command.cooldown * 1000 * reduction;

    if (!cooldownForCommand) {
      const cooldownForCommand = new Map([[userId, newCooldown]]);
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

    const clock = readFileSync(getAssetPath("cooldown.gif"));

    throw new ErrorMessage(
      (t) => t("cooldown.title"),
      (t) =>
        t("cooldown.description", {
          time: formatTime(cooldown - now),
          command: command.name,
        }),
      { color: STATUS_COLORS.warn, thumbnail: { name: "cooldown.gif", data: clock } }
    );
  }

  private getTipResponse(commandName: string, user: User | null): Tip | undefined {
    const TIP_CHANCE = 0.2;

    if (User.isIron(user) || Math.random() > TIP_CHANCE) return undefined;

    const useableTips = tips.filter(
      (t) => !t.disabled?.includes(commandName) && !t.uneligible?.(user)
    );

    if (useableTips.length === 0) return undefined;

    return useableTips[Math.floor(Math.random() * useableTips.length)];
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
