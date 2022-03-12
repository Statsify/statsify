import { Command, CommandContext, EmbedBuilder } from '@statsify/discord';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import { Canvas } from 'skia-canvas';
import { ExampleService } from '../services/example.service';

@Command({
  description: 'Displays this message.',
  args: [
    {
      name: 'message',
      description: 'The message to display.',
      required: true,
      type: ApplicationCommandOptionType.String,
    },
  ],
  cooldown: 5,
})
export class ExampleCommand {
  public constructor(private readonly exampleService: ExampleService) {}

  public async run(context: CommandContext) {
    const canvas = new Canvas(100, 100);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, 100, 100);

    const buffer = await canvas.toBuffer('png');

    const embed = new EmbedBuilder().title('Example').thumbnail('attachment://example.png').build();

    await context.reply({
      files: [{ name: 'example.png', data: buffer, type: 'image/png' }],
      content: 'hello',
      embeds: [embed],
    });
  }
}
