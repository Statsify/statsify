import { Command } from '@statsify/discord';

@Command({
  name: 'help',
  description: 'Displays this message.',
  groups: [],
  cooldown: 5,
})
export class HelpCommand {
  public run() {
    console.log('Help command');
  }
}
