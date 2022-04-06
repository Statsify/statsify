import { Command } from '@statsify/discord';
import { JSX, useComponentHeight, useComponentWidth } from '@statsify/jsx';
import { Table } from '../components/Table';

@Command({
  description: 'Displays this message.',
  args: [],
  cooldown: 5,
})
export class ExampleCommand {
  public async run() {
    const table = (
      <Table
        rows={[
          { data: [{ title: 'Final Kills', value: '10', color: '§7' }] },
          {
            data: [
              { title: 'Final Deaths?', value: '10', color: '§7' },
              { title: 'Final KD', value: '11', color: '§f' },
            ],
          },
        ]}
      />
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
