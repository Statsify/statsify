import { AbstractArgument } from '@statsify/discord';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import { ChoiceArgument } from './choice.argument';

class GuildQueryArgument extends AbstractArgument {
  public name = 'query';
  public description = 'Guild or Player Name';
  public type = ApplicationCommandOptionType.String;
  public required = false;
}

class GuildTypeArgument extends ChoiceArgument {
  public constructor() {
    super('type', ['name', 'NAME'], ['player', 'PLAYER'], ['id', 'ID']);
  }
}

export const GuildArgument = [GuildQueryArgument, GuildTypeArgument];
