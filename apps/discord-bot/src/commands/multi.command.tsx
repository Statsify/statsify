import { Container, Header, HeaderBody, Table } from '#components';
import { ApiService } from '#services';
import { getBackground } from '@statsify/assets';
import { Command } from '@statsify/discord';
import { JSX } from '@statsify/rendering';

@Command({
  description: 'Multi-mode command',
  args: [],
})
export class MultimodeCommand {
  public constructor(private readonly apiService: ApiService) {}

  public async run() {
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

    const background = await getBackground('tntgames', 'overall');

    const Profile = () => (
      <Container background={background}>
        <Header
          skin={skin}
          sidebar={[
            ['Coins', `153,185`, '§6'],
            ['Overall Wins', '3', '§e'],
            ['Blocks Ran', '7,755', '§7'],
          ]}
          name={'§6j4cobi'}
        >
          <HeaderBody description={`Description`} title="§l§cTNT Games §fStats" />
        </Header>
        <div direction="row">
          <HalfTable />
          <HalfTable />
        </div>
        <TableRow />
      </Container>
    );

    const image = await JSX.render(<Profile />).toBuffer('png');

    return {
      files: [{ name: 'example.png', data: image, type: 'image/png' }],
    };
  }
}
