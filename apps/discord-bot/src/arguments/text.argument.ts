/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AbstractArgument, LocalizationString } from "@statsify/discord";
import { ApplicationCommandOptionType } from "discord-api-types/v10";

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
