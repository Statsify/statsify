import type { APIApplicationCommandInteractionDataBasicOption } from 'discord-api-types/v10';
import type { Interaction, InteractionContent } from '../interaction';

export class CommandContext {
  public constructor(private readonly interaction: Interaction, private readonly data: any) {}

  public option<T>(name: string, defaultValue: T): T;
  public option<T>(name: string): T;
  public option<T>(name: string, defaultValue?: T): T {
    const data = (this.data.options as APIApplicationCommandInteractionDataBasicOption[])?.find(
      (o) => o.name === name
    );

    if (!data) {
      if (defaultValue !== undefined) return defaultValue;
      throw new Error(`No option found with name ${name}`);
    }

    return data.value as unknown as T;
  }

  public reply(data: InteractionContent) {
    return this.interaction.editReply(data);
  }
}
