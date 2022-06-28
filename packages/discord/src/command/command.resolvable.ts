/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AbstractArgument } from "../arguments";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "discord-api-types/v10";
import { UserTier } from "@statsify/schemas";
import {
  getLocalizeFunction,
  translateField,
  translateToAllLanguages,
} from "../messages/localize";
import type { CommandContext } from "./command.context";
import type { CommandMetadata } from "./command.interface";

export class CommandResolvable {
  public type:
    | ApplicationCommandType.ChatInput
    | ApplicationCommandOptionType.Subcommand
    | ApplicationCommandOptionType.SubcommandGroup;
  public name: string;
  public description: string;
  public options?: any[];
  public description_localizations: Record<string, string>;

  public args: AbstractArgument[];
  public cooldown: number;
  public tier: UserTier;

  private target: any;
  private methodName: string;

  public constructor(
    {
      name,
      description,
      args,
      methodName,
      cooldown = 0,
      tier = UserTier.NONE,
    }: CommandMetadata,
    target: any
  ) {
    this.name = name;
    this.description = translateField(getLocalizeFunction("en_US"), description);
    this.description_localizations = translateToAllLanguages(description);

    this.type = ApplicationCommandType.ChatInput;
    this.cooldown = cooldown;

    const argsResolved = (args ?? [])?.map((a) =>
      a instanceof AbstractArgument ? a : new a()
    );

    this.args = argsResolved;
    this.options = argsResolved;

    this.target = target;
    this.methodName = methodName;
    this.tier = tier;
  }

  public execute(context: CommandContext) {
    const method = this.target[this.methodName];

    return method.apply(this.target, [context]);
  }

  public addSubCommand(subcommand: CommandResolvable) {
    this.options ??= [];

    subcommand.type = ApplicationCommandOptionType.Subcommand;

    this.options.push(subcommand);
  }

  public addSubCommandGroup(group: CommandResolvable) {
    this.options ??= [];

    group.type = ApplicationCommandOptionType.SubcommandGroup;

    this.options.push(group);
  }

  public toJSON() {
    return {
      name: this.name,
      description: this.description,
      description_localizations: this.description_localizations,
      type: this.type,
      options: this.options?.map((o) => (o.toJSON ? o.toJSON() : o)),
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

    return true;
  }
}
