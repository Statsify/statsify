/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AbstractArgument } from "./abstract.argument.js";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { LocalizationString } from "../messages/index.js";

export class NumberArgument extends AbstractArgument {
  public description: LocalizationString;
  public type = ApplicationCommandOptionType.Integer;
  public required = false;

  public constructor(
    public name = "count",
    public min_value?: number,
    public max_value?: number
  ) {
    super();
    this.description = (t) => t("arguments.number");
  }
}
