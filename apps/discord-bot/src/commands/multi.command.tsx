import { Command } from '@statsify/discord';
import { FontRenderer, JSX } from '@statsify/jsx';
import { Canvas } from 'skia-canvas';
import Container from 'typedi';
import { Header, HeaderBody, Table } from '../components';
import { ApiService } from '../services/api.service';

@Command({
  description: 'Multi-mode command',
  args: [],
})
export class MultimodeCommand {
  public constructor(private readonly apiService: ApiService) {}

  public async run() {
    const width = 1200;
    const height = 600;

    const containerWidth = width * 0.95;
    const containerHeight = height * 0.9;

    const skin = await this.apiService.getPlayerSkin('618a96fec8b0493fa89427891049550b');

    const TableRow = () => (
      <Table.ts title="§6TNT">
        <Table.tr>
          <Table.td title="Wins" value="13,378" color="§a" />
          <Table.td title="Kills" value="66,820" color="§c" />
          <Table.td title="WLR" value="172,620" color="§e" />
        </Table.tr>
      </Table.ts>
    );

    const HalfTable = () => (
      <Table.table width="50%">
        <TableRow />
        <TableRow />
      </Table.table>
    );

    const Profile = () => (
      <div width="100%" height="100%">
        <div direction="column" width={containerWidth} height={containerHeight} align="center">
          <Header
            skin={skin}
            sidebar={[
              ['Coins', `153,185`, '§6'],
              ['Overall Wins', 3, '§e'],
              ['Blocks Ran', '7,755', '§7'],
            ]}
            body={(height) => (
              <HeaderBody
                height={height}
                description={`Description`}
                title="§l§cTNT Games §fStats"
              />
            )}
            width={containerWidth}
            name={'§6j4cobi'}
          />
          <div direction="column">
            <div direction="row">
              <HalfTable />
              <HalfTable />
            </div>
            <TableRow />
          </div>
        </div>
      </div>
    );

    const canvas = new Canvas(width, height);

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFF';
    ctx.fillRect(0, 0, width, height);

    const instructions = JSX.createInstructions(<Profile />, canvas.width, canvas.height);

    const buffer = await JSX.createRender(canvas, instructions, {
      renderer: Container.get(FontRenderer),
    }).toBuffer('png');

    return {
      files: [{ name: 'example.png', data: buffer, type: 'image/png' }],
    };
  }
}
