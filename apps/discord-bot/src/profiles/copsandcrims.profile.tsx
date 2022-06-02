import { Container, Footer, Header, HeaderBody, SidebarItem, Table } from '#components';
import { JSX } from '@statsify/rendering';
import { CopsAndCrimsModes } from '@statsify/schemas';
import { formatTime, prettify } from '@statsify/util';
import { BaseProfileProps } from './base.profile';

export interface CopsAndCrimsProfileProps extends BaseProfileProps {
  mode: CopsAndCrimsModes[number];
}

export const CopsAndCrimsProfile: JSX.FC<CopsAndCrimsProfileProps> = ({
  skin,
  player,
  background,
  logo,
  premium,
  badge,
  mode,
  t,
}) => {
  const { copsandcrims } = player.stats;

  const sidebar: SidebarItem[] = [
    [t('stats.coins'), t(copsandcrims.coins), '§6'],
    [t('stats.wins'), t(copsandcrims.wins), '§a'],
  ];

  let table: JSX.ElementNode;

  switch (mode) {
    case 'defusal':
      table = (
        <>
          <Table.tr>
            <Table.td title={t('stats.kills')} value={t(copsandcrims[mode].wins)} color="§a" />
            <Table.td
              title={t('stats.roundWins')}
              value={t(copsandcrims[mode].roundWins)}
              color="§c"
            />
          </Table.tr>
          <Table.tr>
            <Table.td title={t('stats.kills')} value={t(copsandcrims[mode].kills)} color="§a" />
            <Table.td title={t('stats.deaths')} value={t(copsandcrims[mode].deaths)} color="§c" />
            <Table.td title={t('stats.kdr')} value={t(copsandcrims[mode].kdr)} color="§6" />
            <Table.td title={t('stats.assists')} value={t(copsandcrims[mode].assists)} color="§e" />
          </Table.tr>
          <Table.tr>
            <Table.td
              title={t('stats.headshotKills')}
              value={t(copsandcrims[mode].headshotKills)}
              color="§6"
            />
            <Table.td
              title={t('stats.bombsPlanted')}
              value={t(copsandcrims[mode].bombsPlanted)}
              color="§c"
            />
            <Table.td
              title={t('stats.bombsDefused')}
              value={t(copsandcrims[mode].bombsDefused)}
              color="§a"
            />
          </Table.tr>
        </>
      );
      break;
    case 'deathmatch':
      table = (
        <>
          <Table.tr>
            <Table.td title={t('stats.wins')} value={t(copsandcrims[mode].wins)} color="§a" />
            <Table.td title={t('stats.kills')} value={t(copsandcrims[mode].kills)} color="§a" />
          </Table.tr>
          <Table.tr>
            <Table.td title={t('stats.deaths')} value={t(copsandcrims[mode].deaths)} color="§c" />
            <Table.td title={t('stats.kdr')} value={t(copsandcrims[mode].kdr)} color="§6" />
            <Table.td title={t('stats.assists')} value={t(copsandcrims[mode].assists)} color="§e" />
          </Table.tr>
        </>
      );
      break;
    case 'gunGame':
      table = (
        <>
          <Table.tr>
            <Table.td title={t('stats.wins')} value={t(copsandcrims[mode].wins)} color="§a" />
            <Table.td
              title={t('stats.bestTime')}
              value={formatTime(copsandcrims[mode].fastestWin)}
              color="§b"
            />
          </Table.tr>
          <Table.tr>
            <Table.td title={t('stats.kills')} value={t(copsandcrims[mode].kills)} color="§a" />
            <Table.td title={t('stats.deaths')} value={t(copsandcrims[mode].deaths)} color="§c" />
            <Table.td title={t('stats.kdr')} value={t(copsandcrims[mode].kdr)} color="§6" />
            <Table.td title={t('stats.assists')} value={t(copsandcrims[mode].assists)} color="§e" />
          </Table.tr>
        </>
      );
      break;
  }

  return (
    <Container background={background}>
      <Header skin={skin} name={player.prefixName} badge={badge} sidebar={sidebar}>
        <HeaderBody
          title={`§l§bCops and Crims §fStats §r(${prettify(mode)})`}
          description={`Description`}
        />
      </Header>
      <Table.table>{table}</Table.table>
      <Footer logo={logo} premium={premium} />
    </Container>
  );
};
