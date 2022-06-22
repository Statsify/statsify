/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  APIButtonComponentBase,
  APIMessageComponentEmoji,
  ButtonStyle,
  ComponentType,
} from "discord-api-types/v10";
import { LocalizationString, LocalizeFunction, translateField } from "../localize";
import { randomUUID } from "node:crypto";

export class ButtonBuilder {
  #label: LocalizationString;
  #emoji: APIMessageComponentEmoji;
  #style: ButtonStyle;
  #custom_id?: string;
  #disabled: boolean;
  #url?: string;

  public constructor() {
    this.style(ButtonStyle.Primary);
    this.customId(randomUUID());
  }

  public label(label: LocalizationString): this {
    this.#label = label;
    return this;
  }

  public emoji(emoji: string): this {
    const animated = emoji.startsWith("<a:");
    const name = emoji.replace(/<:|<a:|>/g, "");
    const id = name.split(":")[1];

    this.#emoji = { name: name.replace(id, ""), animated, id };
    return this;
  }

  public style(style: ButtonStyle): this {
    this.#style = style;
    return this;
  }

  public customId(customId: string): this {
    this.#custom_id = customId;
    return this;
  }

  public url(url: string): this {
    this.#url = url;
    this.#custom_id = undefined;
    return this;
  }

  public disable(disabled?: boolean): this {
    if (disabled === undefined) this.#disabled = true;
    else this.#disabled = disabled;

    return this;
  }

  public getCustomId() {
    return this.#custom_id as string;
  }

  public build(
    locale: LocalizeFunction
  ): APIButtonComponentBase<any> & { custom_id?: string; url?: string } {
    return {
      label: translateField(locale, this.#label),
      style: this.#style,
      emoji: this.#emoji,
      custom_id: this.#custom_id,
      disabled: this.#disabled,
      type: ComponentType.Button,
      url: this.#url,
    };
  }
}
