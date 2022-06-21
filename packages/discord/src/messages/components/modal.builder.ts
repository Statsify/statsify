/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIModalInteractionResponseCallbackData } from "discord-api-types/v10";
import { ActionRowBuilder } from "./action-row.builder";
import { LocalizationString, LocalizeFunction, translateField } from "../localize";
import { randomUUID } from "node:crypto";

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
