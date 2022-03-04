import { Command, SubCommand } from '@statsify/discord';

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

  @SubCommand({ name: 'help2', description: 'Displays this messag2e.' })
  public help(): void {
    console.log('Help subcommand');
  }
}
