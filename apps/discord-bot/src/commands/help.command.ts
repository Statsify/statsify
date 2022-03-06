import { Command } from '@statsify/discord';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';

@Command({
  description: 'Displays this message.',
  args: [
    {
      name: 'test',
      type: ApplicationCommandOptionType.String,
      required: true,
      description: 'test',
      autocomplete: true,
    },
  ],
  cooldown: 5,
})
export class HelpCommand {
  public run() {
    console.log('Help command');
  }
}
