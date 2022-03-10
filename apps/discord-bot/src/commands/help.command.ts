import { Command, Interaction, SubCommand } from '@statsify/discord';
import { BelpCommand } from './belp';

@Command({
  description: 'Displays this message.',
  groups: [BelpCommand],
  cooldown: 5,
})
export class HelpCommand {
  public count = 0;

  @SubCommand({ description: 'Displays this message.' })
  public good(interaction: Interaction) {
    this.count++;

    return interaction.sendFollowup({ content: `help good: ${this.count}` });
  }

  @SubCommand({ description: 'Displays this message.' })
  public bad(interaction: Interaction) {
    this.count++;

    return interaction.sendFollowup({ content: `help bad: ${this.count}` });
  }
}
