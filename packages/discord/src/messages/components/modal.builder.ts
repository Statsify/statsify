import { randomUUID } from 'crypto';
import { APIModalInteractionResponseCallbackData } from 'discord-api-types/v10';
import { LocalizationString, LocalizeFunction, translateField } from '../localize';
import { ActionRowBuilder } from './action-row.builder';

export class ModalBuilder {
  #custom_id: string;
  #components: ActionRowBuilder[];
  #title: LocalizationString;

  public constructor(components: ActionRowBuilder[] = []) {
    this.#components = components;
    this.customId(randomUUID());
  }

  public component(component: ActionRowBuilder): this {
    this.#components.push(component);
    return this;
  }

  public customId(customId: string): this {
    this.#custom_id = customId;
    return this;
  }

  public title(title: LocalizationString): this {
    this.#title = title;
    return this;
  }

  public getCustomId() {
    return this.#custom_id;
  }

  public build(locale: LocalizeFunction): APIModalInteractionResponseCallbackData {
    return {
      title: translateField(locale, this.#title),
      custom_id: this.#custom_id,
      components: this.#components.map((component) => component.build(locale)),
    };
  }
}
