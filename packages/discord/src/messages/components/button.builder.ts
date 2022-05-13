import { randomUUID } from 'crypto';
import { APIButtonComponentBase, ButtonStyle, ComponentType } from 'discord-api-types/v10';
import { TFunction } from 'i18next';
import { LocalizationString, translateField } from '../localize';

export class ButtonBuilder {
  #label: LocalizationString;
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
    locale: TFunction
  ): APIButtonComponentBase<any> & { custom_id?: string; url?: string } {
    return {
      label: translateField(locale, this.#label),
      style: this.#style,
      custom_id: this.#custom_id,
      disabled: this.#disabled,
      type: ComponentType.Button,
      url: this.#url,
    };
  }
}
