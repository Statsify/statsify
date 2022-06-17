import { randomUUID } from 'crypto';
import {
  APIMessageComponentEmoji,
  APISelectMenuComponent,
  APISelectMenuOption,
  ComponentType,
} from 'discord-api-types/v10';
import { LocalizationString, LocalizeFunction, translateField } from '../localize';

export class SelectMenuOptionBuilder {
  #label: LocalizationString;
  #value: string;
  #description: LocalizationString;
  #emoji?: APIMessageComponentEmoji;
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

  public emoji(emoji: string): this {
    const animated = emoji.startsWith('<a:');
    const name = emoji.replace(/<:|<a:|>/g, '');
    const id = name.split(':')[1];

    this.#emoji = { name: name.replace(id, ''), animated, id };
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
      emoji: this.#emoji,
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
    if (disabled === undefined) this.#disabled = true;
    else this.#disabled = disabled;

    return this;
  }

  public activeOption(index: number): this {
    this.#options.forEach((option, i) => {
      option.default(i === index);
    });

    return this;
  }

  public getCustomId() {
    return this.#custom_id as string;
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
