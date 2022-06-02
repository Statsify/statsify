import { Container, Footer, Header, HeaderBody, SidebarItem, Table } from '#components';
import { JSX } from '@statsify/rendering';
import { MEGAWALLS_MODES } from '@statsify/schemas';
import { formatTime, prettify } from '@statsify/util';
import { BaseProfileProps } from './base.profile';

export interface MegaWallsProfileProps extends BaseProfileProps {
  mode: typeof MEGAWALLS_MODES[number];
}

export const MegaWallsProfile: JSX.FC<MegaWallsProfileProps> = ({
  skin,
  player,
  background,
  logo,
  premium,
  badge,
  mode,
  t,
}) => {
  const { megawalls } = player.stats;
  const stats = megawalls[mode];

  const sidebar: SidebarItem[] = [
    [t('stats.coins'), t(megawalls.coins), '§6'],
    [t('stats.class'), prettify(megawalls.class), '§e'],
    [t('stats.warCry'), prettify(megawalls.warCry), '§7'],
  ];

  return (
    <Container background={background}>
      <Header skin={skin} name={player.prefixName} badge={badge} sidebar={sidebar}>
        <HeaderBody
          title={`§l§cMega§7Walls §fStats §r(${prettify(mode)})`}
          description={`Description`}
        />
      </Header>
      <Table.table>
        <Table.tr>
          <Table.td title={t('stats.wins')} value={t(stats.wins)} color="§a" />
          <Table.td title={t('stats.losses')} value={t(stats.losses)} color="§c" />
          <Table.td title={t('stats.wlr')} value={t(stats.wlr)} color="§6" />
        </Table.tr>
        <Table.tr>
          <Table.td title={t('stats.finalKills')} value={t(stats.finalKills)} color="§a" />
          <Table.td title={t('stats.finalDeaths')} value={t(stats.finalDeaths)} color="§c" />
          <Table.td title={t('stats.fkdr')} value={t(stats.fkdr)} color="§6" />
          <Table.td title={t('stats.finalAssists')} value={t(stats.finalAssists)} color="§e" />
        </Table.tr>
        <Table.tr>
          <Table.td title={t('stats.kills')} value={t(stats.kills)} color="§a" />
          <Table.td title={t('stats.deaths')} value={t(stats.deaths)} color="§c" />
          <Table.td title={t('stats.kdr')} value={t(stats.kdr)} color="§6" />
          <Table.td title={t('stats.assists')} value={t(stats.assists)} color="§e" />
        </Table.tr>
        <Table.tr>
          <Table.td title={t('stats.playtime')} value={formatTime(stats.playtime)} color="§a" />
          <Table.td title={t('stats.witherDamage')} value={t(stats.witherDamage)} color="§c" />
          <Table.td title={t('stats.witherKills')} value={t(stats.witherKills)} color="§6" />
          <Table.td title={t('stats.points')} value={t(stats.points)} color="§e" />
        </Table.tr>
      </Table.table>
      <Footer logo={logo} premium={premium} />
    </Container>
  );
};
