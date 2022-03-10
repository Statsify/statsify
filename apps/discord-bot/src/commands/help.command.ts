import { Command, CommandContext, Interaction, SubCommand } from '@statsify/discord';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import { BelpCommand } from './belp';

@Command({
  description: 'Displays this message.',
  groups: [BelpCommand],
  cooldown: 5,
})
export class HelpCommand {
  public count = 0;

  @SubCommand({
    description: 'Displays this message.',
    args: [
      {
        name: 'test',
        type: ApplicationCommandOptionType.String,
        description: 'test',
        required: true,
      },
    ],
  })
  public good(context: CommandContext) {
    this.count++;

    console.log(context.option('test'));
  }

  @SubCommand({ description: 'Displays this message.' })
  public bad(interaction: Interaction) {
    this.count++;

    return interaction.sendFollowup({ content: `help bad: ${this.count}` });
  }
}
