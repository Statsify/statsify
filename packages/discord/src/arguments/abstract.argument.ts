/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  LocalizationString,
  getLocalizeFunction,
  translateField,
  translateToAllLanguages,
} from "#messages";
import type {
  APIApplicationCommandOptionChoice,
  ApplicationCommandOptionType,
  ChannelType,
} from "discord-api-types/v10";
import type { CommandContext } from "#command";

export interface AbstractArgument {
  autocompleteHandler?(
    context: CommandContext
  ): APIApplicationCommandOptionChoice[] | Promise<APIApplicationCommandOptionChoice[]>;
}

export abstract class AbstractArgument {
  public abstract name: string;
  public abstract description: LocalizationString;
  public abstract type: ApplicationCommandOptionType;
  public abstract required: boolean;
  public choices?: APIApplicationCommandOptionChoice[];
  public channel_types?: ChannelType;
  public min_value?: number;
  public max_value?: number;
  public autocomplete?: boolean;

  public toJSON() {
    const description = translateField(getLocalizeFunction("en_US"), this.description);

    return {
      name: this.name,
      description,
      description_localizations: translateToAllLanguages(this.description),
      type: this.type,
      required: this.required,
      choices: this.choices,
      channel_types: this.channel_types,
      min_value: this.min_value,
      max_value: this.max_value,
      autocomplete: this.autocomplete,
    };
  }

  public equals(other: AbstractArgument): boolean {
    const d = this.toJSON();

    if (
      d.name !== other.name
      || d.description !== other.description
      || d.type !== other.type
      || d.required !== other.required
      || d.channel_types !== other.channel_types
      || d.min_value !== other.min_value
      || d.max_value !== other.max_value
      || d.autocomplete !== other.autocomplete
      || Boolean(d.choices) !== Boolean(other.choices)
    ) {
      return false;
    }

    if (d.choices && other.choices) {
      if (d.choices.length !== other.choices.length) return false;

      for (let i = 0; i < d.choices.length; i++)
        if (
          d.choices[i].name !== other.choices[i].name
          || d.choices[i].value !== other.choices[i].value
        ) {
          return false;
        }
    }

    return true;
  }
}
