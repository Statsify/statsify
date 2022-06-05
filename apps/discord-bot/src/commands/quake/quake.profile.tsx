import { Container, Footer, Header, SidebarItem, Table } from '#components';
import { QUAKE_MODES } from '@statsify/schemas';
import { prettify } from '@statsify/util';
import { BaseProfileProps } from '../base.hypixel-command';

export interface QuakeProfileProps extends BaseProfileProps {
  mode: typeof QUAKE_MODES[number];
}

export const QuakeProfile = ({
  skin,
  player,
  background,
  logo,
  premium,
  badge,
  mode,
  t,
}: QuakeProfileProps) => {
  const { quake } = player.stats;
  const stats = quake[mode];

  const sidebar: SidebarItem[] = [
    [t('stats.coins'), t(quake.coins), '§6'],
    [t('stats.godlikes'), t(quake.godlikes), '§e'],
    [t('stats.trigger'), `${quake.trigger}s`, '§b'],
    [t('stats.distanceTraveled'), `${t(stats.distanceTraveled)}m`, '§c'],
    [t('stats.highestKillstreak'), t(quake.highestKillstreak), '§4'],
  ];

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l§5Quake §fStats §r(${prettify(mode)})`}
      />
      <Table.table>
        <Table.tr>
          <Table.td title={t('stats.wins')} value={t(stats.wins)} color="§a" />
          <Table.td title={t('stats.winRate')} value={`${stats.winRate}%`} color="§c" />
          <Table.td title={t('stats.kwr')} value={t(stats.kwr)} color="§6" />
        </Table.tr>
        <Table.tr>
          <Table.td title={t('stats.shotsFired')} value={t(stats.shotsFired)} color="§c" />
          <Table.td title={t('stats.headshots')} value={t(stats.headshots)} color="§4" />
          <Table.td title={t('stats.shotAccuracy')} value={`${stats.shotAccuracy}%`} color="§6" />
        </Table.tr>
        <Table.tr>
          <Table.td title={t('stats.kills')} value={t(stats.kills)} color="§a" />
          <Table.td title={t('stats.deaths')} value={t(stats.deaths)} color="§c" />
          <Table.td title={t('stats.kdr')} value={t(stats.kdr)} color="§6" />
          <Table.td title={t('stats.killstreaks')} value={t(stats.killstreaks)} color="§6" />
        </Table.tr>
      </Table.table>
      <Footer logo={logo} premium={premium} />
    </Container>
  );
};
