import { APIActionRowComponent, ComponentType } from 'discord-api-types/v10';
import { LocalizeFunction } from '../localize';
import type { ButtonBuilder } from './button.builder';
import type { SelectMenuBuilder } from './select-menu.builder';

export type ActionRowComponent = ButtonBuilder | SelectMenuBuilder;

export class ActionRowBuilder {
  protected data: APIActionRowComponent<any>;

  public constructor(components: ActionRowComponent[] = []) {
    this.data = {
      components,
      type: ComponentType.ActionRow,
    };
  }

  public component(component: ActionRowComponent): this {
    this.data.components.push(component);
    return this;
  }

  public build(locale: LocalizeFunction): APIActionRowComponent<any> {
    this.data.components = this.data.components.map((c) => c.build(locale));
    return this.data;
  }
}
