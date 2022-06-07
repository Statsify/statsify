import { Container, Footer, Header, SidebarItem, Table } from '#components';
import { CopsAndCrimsModes } from '@statsify/schemas';
import { formatTime, prettify } from '@statsify/util';
import { BaseProfileProps } from '../base.hypixel-command';

export interface CopsAndCrimsProfileProps extends BaseProfileProps {
  mode: CopsAndCrimsModes[number];
}

export const CopsAndCrimsProfile = ({
  skin,
  player,
  background,
  logo,
  premium,
  badge,
  mode,
  t,
  time,
}: CopsAndCrimsProfileProps) => {
  const { copsandcrims } = player.stats;

  const sidebar: SidebarItem[] = [
    [t('stats.coins'), t(copsandcrims.coins), '§6'],
    [t('stats.overallWins'), t(copsandcrims.wins), '§a'],
  ];

  let table: JSX.Element;

  switch (mode) {
    case 'defusal': {
      const stats = copsandcrims[mode];

      table = (
        <Table.table>
          <Table.tr>
            <Table.td title={t('stats.wins')} value={t(stats.wins)} color="§a" />
            <Table.td title={t('stats.roundWins')} value={t(stats.roundWins)} color="§b" />
          </Table.tr>
          <Table.tr>
            <Table.td title={t('stats.kills')} value={t(stats.kills)} color="§a" />
            <Table.td title={t('stats.deaths')} value={t(stats.deaths)} color="§c" />
            <Table.td title={t('stats.kdr')} value={t(stats.kdr)} color="§6" />
            <Table.td title={t('stats.assists')} value={t(stats.assists)} color="§e" />
          </Table.tr>
          <Table.tr>
            <Table.td title={t('stats.bombsDefused')} value={t(stats.bombsDefused)} color="§a" />
            <Table.td title={t('stats.bombsPlanted')} value={t(stats.bombsPlanted)} color="§c" />
            <Table.td title={t('stats.headshotKills')} value={t(stats.headshotKills)} color="§6" />
          </Table.tr>
        </Table.table>
      );

      break;
    }
    case 'deathmatch': {
      const stats = copsandcrims[mode];

      table = (
        <Table.table>
          <Table.tr>
            <Table.td title={t('stats.wins')} value={t(stats.wins)} color="§e" />
            <Table.td title={t('stats.kills')} value={t(stats.kills)} color="§a" />
          </Table.tr>
          <Table.tr>
            <Table.td title={t('stats.deaths')} value={t(stats.deaths)} color="§c" />
            <Table.td title={t('stats.kdr')} value={t(stats.kdr)} color="§6" />
            <Table.td title={t('stats.assists')} value={t(stats.assists)} color="§e" />
          </Table.tr>
        </Table.table>
      );

      break;
    }

    case 'gunGame': {
      const stats = copsandcrims[mode];

      table = (
        <Table.table>
          <Table.tr>
            <Table.td title={t('stats.wins')} value={t(stats.wins)} color="§a" />
            <Table.td title={t('stats.bestTime')} value={formatTime(stats.fastestWin)} color="§b" />
          </Table.tr>
          <Table.tr>
            <Table.td title={t('stats.kills')} value={t(stats.kills)} color="§a" />
            <Table.td title={t('stats.deaths')} value={t(stats.deaths)} color="§c" />
            <Table.td title={t('stats.kdr')} value={t(stats.kdr)} color="§6" />
            <Table.td title={t('stats.assists')} value={t(stats.assists)} color="§e" />
          </Table.tr>
        </Table.table>
      );

      break;
    }
  }

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l§bCops and Crims §fStats §r(${prettify(mode)})`}
        time={time}
      />
      {table}
      <Footer logo={logo} premium={premium} />
    </Container>
  );
};
