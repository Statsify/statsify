import { Command } from '@statsify/discord';
import { FontRenderer, JSX, useComponentHeight, useComponentWidth } from '@statsify/jsx';

@Command({
  description: 'Displays this message.',
  args: [],
  cooldown: 5,
})
export class ExampleCommand {
  public async run() {
    const renderer = new FontRenderer();
    await renderer.loadImages();

    const table = (
      <box
        border={{
          bottomLeft: 4,
          topLeft: 4,
          bottomRight: 4,
          topRight: 4,
        }}
        shadow={2}
      >
        <text renderer={renderer}>Hello World</text>
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
