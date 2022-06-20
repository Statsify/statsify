/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type {
  APIApplicationCommandOptionChoice,
  ApplicationCommandOptionType,
  ChannelType,
} from 'discord-api-types/v10';
import type { CommandContext } from '../command';
import { LocalizationString } from '../messages';
import { getLocalizeFunction, translateField, translateToAllLanguages } from '../messages/localize';

export interface AbstractArgument {
  autocompleteHandler?(context: CommandContext): APIApplicationCommandOptionChoice[];
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
    const description = translateField(getLocalizeFunction('en_US'), this.description);

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
}
