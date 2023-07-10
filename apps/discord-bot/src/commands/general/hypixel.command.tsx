/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Command } from "@statsify/discord";
import { GeneralCommand } from "./general.command.js";

@Command({ description: (t) => t("commands.general") })
export class HypixelCommand extends GeneralCommand {}
