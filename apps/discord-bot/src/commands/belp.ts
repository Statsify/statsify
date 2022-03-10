import { Command, Interaction, SubCommand } from '@statsify/discord';

@Command({ description: 'Displays this message.' })
export class BelpCommand {
  public count = 0;

  @SubCommand({ description: 'Displays this message.' })
  public good(interaction: Interaction) {
    this.count++;

    return interaction.sendFollowup({ content: `belp good: ${this.count}` });
  }

  @SubCommand({ description: 'Displays this message.' })
  public bad(interaction: Interaction) {
    this.count++;

    return interaction.sendFollowup({ content: `belp bad: ${this.count}` });
  }
}
