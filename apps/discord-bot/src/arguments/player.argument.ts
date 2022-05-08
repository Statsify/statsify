import { AbstractArgument } from '@statsify/discord';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';

export class PlayerArgument extends AbstractArgument {
  public name: string;
  public description = 'Hypixel username, uuid, or discord mention';
  public type = ApplicationCommandOptionType.String;
  public required = false;

  public constructor(name = 'player') {
    super();
    this.name = name;
  }
}
