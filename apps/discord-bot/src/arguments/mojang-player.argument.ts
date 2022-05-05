import { AbstractArgument } from '@statsify/discord';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';

export class MojangPlayerArgument extends AbstractArgument {
  public name = 'player';
  public description = 'Hypixel username, uuid, or discord mention';
  public type = ApplicationCommandOptionType.String;
  public required = false;
}
