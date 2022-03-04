import { Command, SubCommand } from '@statsify/discord';

@Command({
  name: 'belp',
  description: 'Belp!',
})
export class BelpCommand {
  @SubCommand({ name: 'h3', description: 'h3' })
  public he3() {
    return 'he3';
  }
}

@Command({
  name: 'help',
  description: 'Displays this message.',
  groups: [BelpCommand],
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

/**
 * Command/
 * SubCommands/
 * SubCommand Groups/
 * Arguments
 * Command Name/
 * Command Description/
 * Cooldowns
 */
