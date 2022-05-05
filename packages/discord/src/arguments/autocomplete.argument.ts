import { APIApplicationCommandOptionChoice, InteractionResponseType } from 'discord-api-types/v10';
import { InteractionResponse } from 'tiny-discord';
import type { CommandContext } from '../command';
import { AbstractArgument } from './abstract.argument';

export abstract class AutocompleteArgument extends AbstractArgument {
  public autocomplete = true;

  public autocompleteHandler(context: CommandContext): InteractionResponse {
    const choices = this.getAutocompleteChoices(context);

    return {
      type: InteractionResponseType.ApplicationCommandAutocompleteResult,
      data: {
        choices,
      },
    };
  }

  public abstract getAutocompleteChoices(
    context: CommandContext
  ): APIApplicationCommandOptionChoice[];
}
