/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  LocalizationString,
  LocalizeFunction,
  translateField,
  translateObject,
} from "./localize.js";
import type {
  APIEmbed,
  APIEmbedAuthor,
  APIEmbedField,
  APIEmbedFooter,
  APIEmbedImage,
  APIEmbedThumbnail,
} from "discord-api-types/v10";

type Field = [name: LocalizationString, value: LocalizationString, inline?: boolean];

interface LocalizedField extends Omit<APIEmbedField, "name" | "value"> {
  name: LocalizationString;
  value: LocalizationString;
}

interface LocalizedFooter extends Omit<APIEmbedFooter, "text"> {
  text: LocalizationString;
}

interface LocalizedAuthor extends Omit<APIEmbedAuthor, "name"> {
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

  public field(
    name: LocalizationString,
    value: LocalizationString,
    inline = false
  ): this {
    this.#fields = this.#fields || [];
    this.#fields.push({ name, value, inline });

    return this;
  }

  public fields(...fields: Field[]): this {
    fields.forEach(field => this.field(...field));

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

  public build(locale: LocalizeFunction): APIEmbed {
    return {
      title: translateField(locale, this.#title),
      description: translateField(locale, this.#description),
      fields: this.#fields?.map(field => translateObject(locale, field)),
      url: this.#url,
      footer: translateObject(locale, this.#footer),
      color: this.#color,
      author: translateObject(locale, this.#author),
      thumbnail: this.#thumbnail,
      image: this.#image,
    };
  }
}

if (import.meta.vitest) {
  const { suite, it, expect } = import.meta.vitest;
  const { getLocalizeFunction } = await import("./localize.js");

  suite("EmbedBuilder", () => {
    it("should create an embed", () => {
      const embed = new EmbedBuilder()
        .title("title")
        .description("description")
        .footer("footerText", "footerIconUrl")
        .field("fieldName", "fieldValue")
        .fields(["fieldName2", "fieldValue2", true])
        .color(0x00_00_00)
        .image("image")
        .author("authorName", "authorIcon", "authorUrl")
        .thumbnail("thumbnail")
        .url("url")
        .build(getLocalizeFunction("en-US"));

      expect(embed).toEqual<APIEmbed>({
        title: "title",
        description: "description",
        footer: { text: "footerText", icon_url: "footerIconUrl" },
        fields: [
          { name: "fieldName", value: "fieldValue", inline: false },
          { name: "fieldName2", value: "fieldValue2", inline: true },
        ],
        color: 0x00_00_00,
        image: {
          url: "image",
        },
        author: {
          name: "authorName",
          icon_url: "authorIcon",
          url: "authorUrl",
        },
        thumbnail: {
          url: "thumbnail",
        },
        url: "url",
      });
    });
  });
}
