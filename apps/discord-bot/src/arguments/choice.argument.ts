import { AbstractArgument } from '@statsify/discord';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';

export type Choice = string | [display: string, value: string | number];

export class ChoiceArgument extends AbstractArgument {
  public description = 'Choice input';
  public type = ApplicationCommandOptionType.String;
  public required = false;

  public constructor(public name: string, ...choices: Choice[]) {
    super();

    this.choices = choices.map((choice) => {
      if (typeof choice === 'string') return { name: choice, value: choice };
      return { name: choice[0], value: choice[1] };
    });
  }
}
