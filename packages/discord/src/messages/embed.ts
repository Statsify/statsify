import type {
  APIEmbed,
  APIEmbedAuthor,
  APIEmbedField,
  APIEmbedFooter,
  APIEmbedImage,
  APIEmbedThumbnail,
} from 'discord-api-types/v10';
import { TFunction } from 'i18next';
import { LocalizationString, translateField, translateObject } from './localize';

type Field = [name: LocalizationString, value: LocalizationString, inline?: boolean];

interface LocalizedField extends Omit<APIEmbedField, 'name' | 'value'> {
  name: LocalizationString;
  value: LocalizationString;
}

interface LocalizedFooter extends Omit<APIEmbedFooter, 'text'> {
  text: LocalizationString;
}

interface LocalizedAuthor extends Omit<APIEmbedAuthor, 'name'> {
  name: LocalizationString;
}

export class EmbedBuilder {
  #title?: LocalizationString;
  #description?: LocalizationString;
  #fields?: LocalizedField[];
  #url?: string;
  #footer?: LocalizedFooter;
  #color?: number;
  #author?: LocalizedAuthor;
  #thumbnail?: APIEmbedThumbnail;
  #image?: APIEmbedImage;

  public constructor(data?: EmbedBuilder) {
    if (data) Object.assign(this, data);
  }

  public title(title: LocalizationString): this {
    this.#title = title;
    return this;
  }

  public description(description: LocalizationString): this {
    this.#description = description;
    return this;
  }

  public field(name: LocalizationString, value: LocalizationString, inline = false): this {
    this.#fields = this.#fields || [];
    this.#fields.push({ name, value, inline });

    return this;
  }

  public fields(...fields: Field[]): this {
    fields.forEach((field) => this.field(...field));

    return this;
  }

  public url(url: string): this {
    this.#url = url;
    return this;
  }

  public footer(text: LocalizationString, icon?: string): this {
    this.#footer = {
      text,
      icon_url: icon,
    };

    return this;
  }

  public color(color: number): this {
    this.#color = color;
    return this;
  }

  public author(name: LocalizationString, icon?: string, url?: string): this {
    this.#author = {
      name,
      icon_url: icon,
      url,
    };

    return this;
  }

  public thumbnail(url: string): this {
    this.#thumbnail = {
      url,
    };

    return this;
  }

  public image(url: string): this {
    this.#image = {
      url,
    };

    return this;
  }

  public copy() {
    return new EmbedBuilder(this);
  }

  public build(locale: TFunction): APIEmbed {
    return {
      title: translateField(locale, this.#title),
      description: translateField(locale, this.#description),
      fields: this.#fields?.map((field) => translateObject(locale, field)),
      url: this.#url,
      footer: translateObject(locale, this.#footer),
      color: this.#color,
      author: translateObject(locale, this.#author),
      thumbnail: this.#thumbnail,
      image: this.#image,
    };
  }
}
