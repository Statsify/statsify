import { APIActionRowComponent, ComponentType } from 'discord-api-types/v10';
import type { ButtonBuilder } from './button.builder';

export class ActionRowBuilder {
  protected data: APIActionRowComponent<any>;

  public constructor() {
    this.data = {
      components: [] as any[],
      type: ComponentType.ActionRow,
    };
  }

  public component(component: ButtonBuilder): this {
    this.data.components.push(component);
    return this;
  }

  public build(): APIActionRowComponent<any> {
    this.data.components = this.data.components.map((c) => c.build());
    return this.data;
  }
}
