/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Fuse from "fuse.js";
import {
  APIApplicationCommandOptionChoice,
  ApplicationCommandOptionType,
} from "discord-api-types/v10";
import { AbstractArgument, CommandContext, ErrorMessage, LocalizationString } from "@statsify/discord";
import type { GameModeWithSubModes, GameModes, Mode } from "@statsify/schemas";

// Discord select menus and autocomplete both allow at most 25 options
const MAX_OPTIONS = 25;

export class KitArgument<T extends Mode[]> extends AbstractArgument {
  public name = "kit";
  public description: LocalizationString;
  public type = ApplicationCommandOptionType.String;
  public required = false;
  public autocomplete = true;

  private kits: APIApplicationCommandOptionChoice<string>[];
  private fuse: Fuse<APIApplicationCommandOptionChoice<string>>;

  public constructor(modes: GameModes<T>) {
    super();
    this.description = (t) => t("arguments.kit");

    const [, ...kits] = modes.getModes();
    this.kits = kits.map(({ api, formatted }) => ({ name: formatted, value: api }));

    this.fuse = new Fuse(this.kits, {
      keys: ["name", "value"],
      includeScore: false,
      shouldSort: true,
      isCaseSensitive: false,
      threshold: 0.3,
      ignoreLocation: true,
    });
  }

  public autocompleteHandler(
    context: CommandContext
  ): APIApplicationCommandOptionChoice[] {
    const query = context.option<string>(this.name, "");

    if (!query) return this.kits.slice(0, MAX_OPTIONS);

    return this.fuse
      .search(query)
      .map((result) => result.item)
      .slice(0, MAX_OPTIONS);
  }
}

export function filterKits<T extends Mode[]>(
  modes: GameModeWithSubModes<T>[],
  compareActivity: (a: GameModeWithSubModes<T>, b: GameModeWithSubModes<T>) => number,
  kit?: string | null
): GameModeWithSubModes<T>[] {
  const [overall, ...kits] = modes;
  kits.sort(compareActivity);

  if (!kit) return [overall, ...kits.slice(0, MAX_OPTIONS - 1)];

  const selected = kits.find((mode) => mode.api === kit.toLowerCase());
  if (!selected) throw new ErrorMessage("errors.invalidKit");

  const others = kits.filter((mode) => mode !== selected);

  return [selected, overall, ...others.slice(0, MAX_OPTIONS - 2)];
}
