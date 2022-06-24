/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AbstractArgument } from "./abstract.argument";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { LocalizationString } from "../messages";

export class TextArgument extends AbstractArgument {
  public type = ApplicationCommandOptionType.String;

  public constructor(
    public name = "content",
    public description: LocalizationString = (t) => t("arguments.text"),
    public required = true
  ) {
    super();
  }
}
