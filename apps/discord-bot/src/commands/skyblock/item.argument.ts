/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { AbstractArgument, ApiService, type CommandContext, type LocalizationString } from "@statsify/discord";
import { type APIApplicationCommandOptionChoice, ApplicationCommandOptionType } from "discord-api-types/v10";
import { Container } from "typedi";

export class ItemArgument extends AbstractArgument {
  public name = "item";
  public description: LocalizationString;
  public type = ApplicationCommandOptionType.String;
  public required = true;
  public autocomplete = true;

  public constructor() {
    super();
    this.description = (t) => t("arguments.skyblock-item");
  }

  public async autocompleteHandler(context: CommandContext): Promise<APIApplicationCommandOptionChoice[]> {
    const query = context.option<string>(this.name, "");
    if (!query) return [];

    const items = await Container.get(ApiService).getSkyBlockItems(query).catch(() => []);
    return items.map(({ id, name }) => ({ name, value: id }));
  }
}
