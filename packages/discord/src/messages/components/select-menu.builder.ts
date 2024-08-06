/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  APISelectMenuComponent,
  APISelectMenuOption,
  ComponentType,
} from "discord-api-types/v10";
import { LocalizationString, LocalizeFunction, translateField } from "../localize.js";
import { parseEmoji } from "./parse-emoji.js";
import { randomUUID } from "node:crypto";

export class SelectMenuOptionBuilder {
  #label: LocalizationString;
  #value: string;
  #description: LocalizationString;
  #emoji?: LocalizationString;
  #defaultValue: boolean;

  public label(label: LocalizationString): this {
    this.#label = label;
    return this;
  }

  public value(value: string): this {
    this.#value = value;
    return this;
  }

  public description(description: LocalizationString): this {
    this.#description = description;
    return this;
  }

  public emoji(emoji: LocalizationString): this {
    this.#emoji = emoji;
    return this;
  }

  public default(defaultValue: boolean): this {
    this.#defaultValue = defaultValue;
    return this;
  }

  public build(locale: LocalizeFunction): APISelectMenuOption {
    return {
      label: translateField(locale, this.#label),
      value: this.#value,
      description: translateField(locale, this.#description),
      emoji: this.#emoji ? parseEmoji(this.#emoji, locale) : undefined,
      default: this.#defaultValue,
    };
  }
}

export class SelectMenuBuilder {
  #custom_id: string;
  #disabled: boolean;
  #options: SelectMenuOptionBuilder[] = [];

  public constructor() {
    this.customId(randomUUID());
  }

  public option(option: SelectMenuOptionBuilder): this {
    this.#options.push(option);
    return this;
  }

  public customId(customId: string): this {
    this.#custom_id = customId;
    return this;
  }

  public disable(disabled?: boolean): this {
    this.#disabled = disabled === undefined ? true : disabled;

    return this;
  }

  public activeOption(index: number): this {
    this.#options.forEach((option, i) => {
      option.default(i === index);
    });

    return this;
  }

  public getCustomId() {
    return this.#custom_id;
  }

  public build(locale: LocalizeFunction): APISelectMenuComponent {
    return {
      custom_id: this.#custom_id,
      type: ComponentType.SelectMenu,
      disabled: this.#disabled,
      options: this.#options.map((option) => option.build(locale)),
    };
  }
}
