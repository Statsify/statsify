/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AbstractArgument } from "#arguments";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  ApplicationIntegrationType,
  InteractionContextType,
} from "discord-api-types/v10";
import { UserTier } from "@statsify/schemas";
import { getLocalizeFunction, translateField, translateToAllLanguages } from "#messages";
import type { CommandContext } from "./command.context.js";
import type { CommandMetadata } from "./command.interface.js";

export class CommandResolvable {
  public type:
    | ApplicationCommandType.ChatInput
    | ApplicationCommandOptionType.Subcommand
    | ApplicationCommandOptionType.SubcommandGroup;
  public name: string;
  public description: string;
  public options?: any[];
  public description_localizations: Record<string, string>;
  public integration_types: ApplicationIntegrationType[];
  public contexts: InteractionContextType[];

  public args: AbstractArgument[];
  public cooldown: number;
  public tier: UserTier;
  public preview?: string;

  private target: any;
  private methodName: string;

  public constructor(
    {
      name,
      description,
      args,
      guildCommand = true,
      userCommand = true,
      methodName,
      tier = UserTier.NONE,
      preview,
      cooldown = 10,
    }: CommandMetadata,
    target: any
  ) {
    this.name = name;
    this.description = translateField(getLocalizeFunction("en_US"), description);
    this.description_localizations = translateToAllLanguages(description);

    this.integration_types = [];
    this.contexts = [];

    if (guildCommand) {
      this.integration_types.push(ApplicationIntegrationType.GuildInstall);
      this.contexts.push(InteractionContextType.Guild);
    }
    
    if (userCommand) {
      this.integration_types.push(ApplicationIntegrationType.UserInstall);
      this.contexts.push(InteractionContextType.PrivateChannel, InteractionContextType.BotDM);
    }

    this.type = ApplicationCommandType.ChatInput;
    this.cooldown = cooldown;

    const argsResolved = (args ?? []).map((a) =>
      a instanceof AbstractArgument ? a : new a()
    );

    this.args = argsResolved;
    this.options = argsResolved;

    this.target = target;
    this.methodName = methodName;
    this.tier = tier;
    this.preview = preview;
  }

  public execute(context: CommandContext) {
    const method = this.target[this.methodName];

    return method.apply(this.target, [context]);
  }

  /**
   *
   * Add a subcommand or subcommand group to this command.
   */
  public addCommand(command: CommandResolvable) {
    this.options ??= [];
    this.options.push(command);
  }

  public asSubCommandGroup() {
    this.type = ApplicationCommandOptionType.SubcommandGroup;
    return this;
  }

  public asSubCommand() {
    this.type = ApplicationCommandOptionType.Subcommand;
    return this;
  }

  public toJSON() {
    return {
      name: this.name,
      description: this.description,
      description_localizations: this.description_localizations,
      type: this.type,
      options: this.options?.map((o) => (o.toJSON ? o.toJSON() : o)),
      integration_types: this.integration_types,
      contexts: this.contexts,
    };
  }

  public equals(other: CommandResolvable): boolean {    
    const d = this.toJSON();

    if (
      d.name !== other.name ||
      d.description !== other.description ||
      d.type !== other.type
    ) {
      return false;
    }

    if (this.options?.length && other.options?.length) {
      if (this.options.length !== other.options.length) return false;

      for (let i = 0; i < this.options.length; i++)
        if (!this.options[i].equals(other.options[i])) return false;
    }

    if (d.description_localizations && other.description_localizations) {
      for (const key in this.description_localizations)
        if (d.description_localizations[key] !== other.description_localizations[key])
          return false;
    }

    if (d.integration_types && other.integration_types) {
      if (d.integration_types.length !== other.integration_types.length) return false;

      for (let i = 0; i < d.integration_types.length; i++)
        if (this.integration_types[i] !== other.integration_types[i]) return false;
    }

    if (d.contexts && other.contexts) {
      if (d.contexts.length !== other.contexts.length) return false;

      for (let i = 0; i < d.contexts.length; i++)
        if (this.contexts[i] !== other.contexts[i]) return false;
    }

    return true;
  }
}
