import type { User } from '@statsify/schemas';
import { noop } from '@statsify/util';
import type { APIApplicationCommandInteractionDataBasicOption } from 'discord-api-types/v10';
import i18next, { TFunction } from 'i18next';
import type { Interaction, InteractionContent } from '../interaction';

export class CommandContext {
  private user: User | null;

  public constructor(private readonly interaction: Interaction, private readonly data: any) {
    this.user = null;
  }

  public getUser() {
    return this.user;
  }

  public setUser(user: User | null) {
    this.user = user;
  }

  public option<T>(name: string, defaultValue: T): T;
  public option<T>(name: string): T;
  public option<T>(name: string, defaultValue?: T): T {
    const data = (this.data.options as APIApplicationCommandInteractionDataBasicOption[])?.find(
      (o) => o.name === name
    );

    if (!data) {
      return defaultValue ?? noop();
    }

    return data.value as unknown as T;
  }

  public t(...args: Parameters<TFunction>) {
    return i18next.getFixedT(this.interaction.getLocale())(...args);
  }

  public reply(data: InteractionContent) {
    return this.interaction.editReply(data);
  }

  public getInteraction() {
    return this.interaction;
  }
}
