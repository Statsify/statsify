/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { LocalizationString } from "../messages";
import { UserTier } from "@statsify/schemas";
import type { AbstractArgument } from "../arguments";
import type { Constructor } from "@statsify/util";

export interface CommandOptions {
  name?: string;
  description: LocalizationString;
  groups?: Constructor<any>[];
  args?: (AbstractArgument | Constructor<AbstractArgument>)[];
  cooldown?: number;

  /**
   * The minimum user tier required to use this command.
   */
  tier?: UserTier;
}

export type SubCommandOptions = Omit<CommandOptions, "groups" | "cooldown">;

export interface CommandMetadata extends Omit<CommandOptions, "name"> {
  name: string;
  methodName: string;
}

export type SubCommandMetadata = Record<string, Omit<CommandMetadata, "groups">>;
