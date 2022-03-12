import type { APIEmbed } from 'discord-api-types/v10';

type Field = [name: string, value: string, inline?: boolean];

export class EmbedBuilder {
  private data: APIEmbed;

  public constructor() {
    this.data = {};
  }

  public title(title: string): this {
    this.data.title = title;
    return this;
  }

  public description(description: string): this {
    this.data.description = description;
    return this;
  }

  public field(name: string, value: string, inline = false): this {
    this.data.fields = this.data.fields || [];

    this.data.fields.push({
      name,
      value,
      inline,
    });

    return this;
  }

  public fields(...fields: Field[]): this {
    fields.forEach((field) => this.field(...field));

    return this;
  }

  public url(url: string): this {
    this.data.url = url;
    return this;
  }

  public footer(text: string, icon?: string): this {
    this.data.footer = {
      text,
      icon_url: icon,
    };

    return this;
  }

  public color(color: number): this {
    this.data.color = color;
    return this;
  }

  public author(name: string, icon?: string, url?: string): this {
    this.data.author = {
      name,
      icon_url: icon,
      url,
    };

    return this;
  }

  public thumbnail(url: string): this {
    this.data.thumbnail = {
      url,
    };

    return this;
  }

  public image(url: string): this {
    this.data.image = {
      url,
    };

    return this;
  }

  public build(): APIEmbed {
    return this.data;
  }
}
