import { GuildQuery } from '@statsify/api-client';
import { AbstractArgument, LocalizationString } from '@statsify/discord';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import { ChoiceArgument } from './choice.argument';

class GuildQueryArgument extends AbstractArgument {
  public description: LocalizationString;
  public name = 'query';
  public type = ApplicationCommandOptionType.String;
  public required = false;

  public constructor() {
    super();
    this.description = (t) => t('arguments.guild-query');
  }
}

class GuildTypeArgument extends ChoiceArgument {
  public constructor() {
    super('type', ['name', GuildQuery.NAME], ['player', GuildQuery.PLAYER], ['id', GuildQuery.ID]);
  }
}

export const GuildArgument = [GuildQueryArgument, GuildTypeArgument];
