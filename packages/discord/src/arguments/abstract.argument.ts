import type {
  APIApplicationCommandOptionChoice,
  ApplicationCommandOptionType,
  ChannelType,
} from 'discord-api-types/v10';
import { InteractionResponse } from 'tiny-discord';
import type { CommandContext } from '../command';

export interface AbstractArgument {
  autocompleteHandler?(context: CommandContext): InteractionResponse;
}

export abstract class AbstractArgument {
  public abstract name: string;
  public abstract description: string;
  public abstract type: ApplicationCommandOptionType;
  public abstract required: boolean;
  public choices?: APIApplicationCommandOptionChoice[];
  public channel_types?: ChannelType;
  public min_value?: number;
  public max_value?: number;
  public autocomplete?: boolean;
}
