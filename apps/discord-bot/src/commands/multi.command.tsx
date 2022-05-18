import { Command } from '@statsify/discord';
import { FontRenderer, JSX } from '@statsify/jsx';
import { Canvas } from 'skia-canvas';
import { Container as ClassContainer } from 'typedi';
import { Header, HeaderBody, Table } from '../components';
import { Container } from '../components/Container';
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
      <Container width={width} height={height} percent={95}>
        {(width) => (
          <div>
            <Header
              skin={skin}
              sidebar={[
                ['Coins', `153,185`, '§6'],
                ['Overall Wins', 3, '§e'],
                ['Blocks Ran', '7,755', '§7'],
              ]}
              width={width}
              name={'§6j4cobi'}
            >
              {(height) => (
                <HeaderBody
                  height={height}
                  description={`Description`}
                  title="§l§cTNT Games §fStats"
                />
              )}
            </Header>
            <div direction="column">
              <div direction="row">
                <HalfTable />
                <HalfTable />
              </div>
              <TableRow />
            </div>
          </div>
        )}
      </Container>
    );

    const canvas = new Canvas(width, height);

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFF';
    ctx.fillRect(0, 0, width, height);

    const instructions = JSX.createInstructions(<Profile />, canvas.width, canvas.height);

    const buffer = await JSX.createRender(canvas, instructions, {
      renderer: ClassContainer.get(FontRenderer),
    }).toBuffer('png');

    return {
      files: [{ name: 'example.png', data: buffer, type: 'image/png' }],
    };
  }
}
