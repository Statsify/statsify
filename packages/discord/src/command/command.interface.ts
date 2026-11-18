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

  /**
   * Also adds a user command with this name, shown when you right-click a user. It runs this
   * command with no options, and the user is the interaction's `target_id`.
   */
  contextMenu?: LocalizationString;

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
}

export interface SubCommandOptions extends Omit<CommandOptions, "cooldown" | "contextMenu"> {
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
