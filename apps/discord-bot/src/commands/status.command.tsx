import { PlayerArgument } from '#arguments';
import { Container, Footer, Header, If, Table } from '#components';
import { ApiService } from '#services';
import { getBackground, getLogo } from '@statsify/assets';
import { Command, CommandContext, LocalizeFunction } from '@statsify/discord';
import { render } from '@statsify/rendering';
import { Status } from '@statsify/schemas';
import { formatTime, prettify } from '@statsify/util';
import { getTheme } from '../themes';

@Command({
  description: (t) => t('commands.status'),
  args: [PlayerArgument],
  cooldown: 5,
})
export class StatusCommand {
  public constructor(private readonly apiService: ApiService) {}
  public async run(context: CommandContext) {
    const t = context.t();

    const user = context.getUser();

    const status = await this.apiService.getStatus(context.option('player'), user);

    const [logo, skin, badge] = await Promise.all([
      getLogo(user?.tier),
      this.apiService.getPlayerSkin(status.uuid),
      this.apiService.getUserBadge(status.uuid),
    ]);

    let background = await getBackground('default', '');

    if (status.online && status.game.name != 'Limbo') {
      background = await getBackground(status.game.name.toLowerCase(), 'overall');
    }

    const container = (
      <Container background={background}>
        <Header
          name={status.prefixName}
          skin={skin}
          badge={badge}
          title="Player Status"
          time={'LIVE'}
        />
        <If condition={status.actions.statusHidden}>{this.hiddenTable(status, t)}</If>
        <If condition={status.online}>{await this.onlineTable(status, t)}</If>
        <If condition={!status.actions.statusHidden && !status.online}>
          {this.offlineTable(status, t)}
        </If>
        <Footer logo={logo} tier={user?.tier} />
      </Container>
    );

    const canvas = render(container, getTheme(user?.theme));
    const img = await canvas.toBuffer('png');

    return {
      files: [{ name: 'status.png', data: img, type: 'image/png' }],
    };
  }

  private hiddenTable(status: Status, t: LocalizeFunction) {
    return (
      <Table.table>
        <Table.tr>
          <Table.td title="Status" value={`§c${t('stats.hidden')}`} color="§b" />
        </Table.tr>
        <Table.tr>
          <Table.td
            title={t('stats.lastActionTime')}
            value={this.timeAgo(status.actions.lastActionTime, t)}
            color="§a"
          />
          <Table.td
            title={t('stats.lastAction')}
            value={prettify(status.actions.lastAction)}
            color="§a"
          />
        </Table.tr>
      </Table.table>
    );
  }

  private async onlineTable(status: Status, t: LocalizeFunction) {
    const resource = await this.apiService.getResource('games');
    const gameInfo = resource?.games;
    const gameCounts = await this.apiService.getGameCounts();

    const gameName = gameInfo?.[status.game.code]?.name ?? status.game.name;

    const game = (
      <Table.tr>
        <Table.td title={t('stats.game')} value={gameName} color="§a" />
        <Table.td
          title={`${gameName} ${t('players')}`}
          value={t(gameCounts[status.game.code as keyof typeof gameCounts].players)}
          color="§a"
        />
      </Table.tr>
    );

    let mode = <></>;
    if (status.mode) {
      const modeName =
        gameInfo[status.game.code]?.modeNames?.[status.mode] ?? prettify(status.mode.toLowerCase());

      mode = (
        <Table.tr>
          <Table.td title={t('stats.mode')} value={modeName} color="§e" />
          <Table.td title={t('stats.map')} value={status.map ?? t('unknown')} color="§e" />
        </Table.tr>
      );
    }

    return (
      <Table.table>
        <Table.tr>
          <Table.td title={t('stats.status')} value={`§a${t('stats.online')}`} color="§b" />
          <Table.td title={t('stats.version')} value={status.actions.version} color="§b" />
          <Table.td
            title={t('stats.loginTime')}
            value={this.timeAgo(status.actions.lastLogin, t)}
            color="§b"
          />
        </Table.tr>
        {game}
        {mode}
      </Table.table>
    );
  }

  private offlineTable(status: Status, t: LocalizeFunction) {
    return (
      <Table.table>
        <Table.tr>
          <Table.td title="Status" value={`§7${t('stats.offline')}`} color="§b" />
        </Table.tr>
        <Table.tr>
          <Table.td
            title={t('stats.logoutTime')}
            value={this.timeAgo(status.actions.lastLogout, t)}
            color="§a"
          />
          <Table.td title={t('stats.lastGame')} value={status.actions.lastGame.name} color="§a" />
        </Table.tr>
      </Table.table>
    );
  }

  private timeAgo(timestamp: number, t: LocalizeFunction) {
    const difference = Date.now() - timestamp;
    if (difference < 60000) {
      return t('now');
    }

    return `${formatTime(Date.now() - timestamp, { short: true })} ${t('ago')}`;
  }
}
