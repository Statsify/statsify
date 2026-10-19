/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { LocalizationString } from "#messages";
import { UserTier } from "@statsify/schemas";
import type { AbstractArgument } from "#arguments";
import type { Constructor } from "@statsify/util";

export interface CommandOptions {
  name?: string;
  description: LocalizationString;
  args?: (AbstractArgument | Constructor<AbstractArgument>)[];

  /**
   * @default true
   */
  userCommand?: boolean;
  /**
   * @default true
   */
  guildCommand?: boolean;

  cooldown?: number;

  /**
   * The minimum user tier required to use this command.
   */
  tier?: UserTier;

  /**
   * The path to a preview image for this command. The preview will show on error messages sent to the user because they do not have the required tier to run the command.
   * @example badge.png
   */
  preview?: string;

  /**
   * Whether only the user who ran the command can see its reply. Discord decides this when the command is deferred, so returning `ephemeral: true` from the command isn't enough on its own.
   * @default false
   */
  ephemeral?: boolean;
}

export interface SubCommandOptions extends Omit<CommandOptions, "cooldown"> {
  group?: string;
}

export interface CommandMetadata extends Omit<CommandOptions, "name"> {
  name: string;
  methodName: string;
}

export interface SubCommandMetadata extends Omit<SubCommandOptions, "name"> {
  name: string;
  methodName: string;
}
