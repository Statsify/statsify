/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AbstractArgument } from "./abstract.argument";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { ChoiceArgument } from "./choice.argument";
import { GuildQuery } from "@statsify/api-client";
import { LocalizationString } from "../messages";

class GuildQueryArgument extends AbstractArgument {
  public description: LocalizationString;
  public name = "query";
  public type = ApplicationCommandOptionType.String;
  public required = false;

  public constructor() {
    super();
    this.description = (t) => t("arguments.guild-query");
  }
}

class GuildTypeArgument extends ChoiceArgument {
  public constructor() {
    super(
      "type",
      false,
      ["name", GuildQuery.NAME],
      ["player", GuildQuery.PLAYER],
      ["id", GuildQuery.ID]
    );
  }
}

export const GuildArgument = [GuildQueryArgument, GuildTypeArgument];
