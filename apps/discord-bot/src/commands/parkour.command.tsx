import { PlayerArgument } from '#arguments';
import { Container, Footer, Header, Table } from '#components';
import { ApiService } from '#services';
import { getBackground, getLogo } from '@statsify/assets';
import { Command, CommandContext } from '@statsify/discord';
import { render } from '@statsify/rendering';
import { LeaderboardScanner, Parkour } from '@statsify/schemas';
import { formatTime, removeFormatting } from '@statsify/util';
import { getTheme } from '../themes';

@Command({
  description: (t) => t('commands.parkour'),
  args: [PlayerArgument],
  cooldown: 5,
})
export class ParkourCommand {
  public constructor(private readonly apiService: ApiService) {}
  public async run(context: CommandContext) {
    const user = context.getUser();

    const player = await this.apiService.getWithUser(
      user,
      this.apiService.getPlayer,
      context.option('player')
    );

    const { parkour } = player.stats;

    const [logo, skin, badge] = await Promise.all([
      getLogo(user?.tier),
      this.apiService.getPlayerSkin(player.uuid),
      this.apiService.getUserBadge(player.uuid),
    ]);
    const background = await getBackground('default', '');

    const Times = Object.entries(parkour).map(([field, time]) => [
      removeFormatting(
        LeaderboardScanner.getLeaderboardField(Parkour, field).name.replace(/Lobby/g, '').trim()
      ),
      time == 0 ? null : time,
    ]);

    Times.sort((a, b) => (a[1] ?? Number.MAX_VALUE) - (b[1] ?? Number.MAX_VALUE));

    const rowSize = 4;
    const rows = Array.from({ length: Math.ceil(Times.length / rowSize) }, (_, i) =>
      Times.slice(i * rowSize, (i + 1) * rowSize)
    );

    const container = (
      <Container background={background}>
        <Header
          name={player.prefixName}
          skin={skin}
          badge={badge}
          title="Parkour Times"
          time={'LIVE'}
        />
        <Table.table>
          {rows.map((row) => (
            <Table.tr>
              {row.map((game) => (
                <Table.td
                  title={`§a§l${game[0]}`}
                  value={game[1] ? formatTime(game[1], { short: true, accuracy: 'second' }) : 'N/A'}
                  color="§e"
                />
              ))}
            </Table.tr>
          ))}
        </Table.table>
        <Footer logo={logo} tier={user?.tier} />
      </Container>
    );

    const canvas = render(container, getTheme(user?.theme));
    const img = await canvas.toBuffer('png');

    return {
      files: [{ name: 'parkour.png', data: img, type: 'image/png' }],
    };
  }
}
