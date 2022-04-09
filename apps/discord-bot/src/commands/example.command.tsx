import { Command, CommandContext } from '@statsify/discord';
import { FontRenderer, JSX, useComponentHeight, useComponentWidth } from '@statsify/jsx';
import { ApplicationCommandOptionType } from 'discord-api-types/v10';

@Command({
  description: 'Displays this message.',
  args: [
    {
      name: 'text',
      description: 'The text to display.',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  cooldown: 5,
})
export class ExampleCommand {
  public async run(context: CommandContext) {
    const renderer = new FontRenderer();
    await renderer.loadImages();

    const table = (
      <box>
        <text renderer={renderer}>{context.option('text')}</text>
      </box>
    );

    const width = useComponentWidth(table);
    const height = useComponentHeight(table);

    const canvas = JSX.createRender(table, width, height);

    const buffer = canvas.toBuffer();

    return {
      files: [{ name: 'example.png', data: buffer, type: 'image/png' }],
      content: 'hello',
    };
  }
}
