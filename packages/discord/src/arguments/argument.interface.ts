import type {
  APIApplicationCommandOptionChoice,
  ApplicationCommandOptionType,
  ChannelType,
} from 'discord-api-types/v10';

export interface Argument {
  name: string;
  description: string;
  type: ApplicationCommandOptionType;
  required: boolean;
  choices?: APIApplicationCommandOptionChoice[];
  channel_types?: ChannelType;
  min_value?: number;
  max_value?: number;
  autocomplete?: boolean;
}
