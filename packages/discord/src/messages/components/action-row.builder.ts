/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIActionRowComponent, ComponentType } from 'discord-api-types/v10';
import { LocalizeFunction } from '../localize';
import type { ButtonBuilder } from './button.builder';
import type { SelectMenuBuilder } from './select-menu.builder';
import type { TextInputBuilder } from './text-input.builder';

export type ActionRowComponent = ButtonBuilder | SelectMenuBuilder | TextInputBuilder;

export class ActionRowBuilder {
  #components: ActionRowComponent[];

  public constructor(components: ActionRowComponent[] = []) {
    this.#components = components;
  }

  public component(component: ActionRowComponent): this {
    this.#components.push(component);
    return this;
  }

  public build(locale: LocalizeFunction): APIActionRowComponent<any> {
    return {
      type: ComponentType.ActionRow,
      components: this.#components.map((c) => c.build(locale)),
    };
  }
}
