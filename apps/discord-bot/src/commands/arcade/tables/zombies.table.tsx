import { Table } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { Zombies, ZombiesMap } from '@statsify/schemas';
import { formatTime } from '@statsify/util';

interface ZombiesMapColumnProps {
  title: string;
  stats: ZombiesMap;
  t: LocalizeFunction;
}

const ZombiesMapColumn = ({ title, stats, t }: ZombiesMapColumnProps) => {
  const mapStat =
    stats.wins > 0
      ? [t('stats.fastestWin'), formatTime(stats.fastestWin)]
      : [t('stats.bestRound'), t(stats.bestRound)];

  return (
    <Table.ts title={`§6${title}`}>
      <Table.td title={t('stats.wins')} value={t(stats.wins)} color="§a" size="small" />
      <Table.td title={mapStat[0]} value={mapStat[1]} color="§c" size="small" />
    </Table.ts>
  );
};

export interface ZombiesTableProps {
  stats: Zombies;
  t: LocalizeFunction;
}

export const ZombiesTable = ({ stats, t }: ZombiesTableProps) => {
  const { overall, deadEnd, badBlood, alienArcadium } = stats;

  return (
    <Table.table>
      <Table.tr>
        <Table.td title={t('stats.wins')} value={t(overall.wins)} color="§a" />
        <Table.td title={t('stats.doorsOpened')} value={t(overall.doorsOpened)} color="§e" />
        <Table.td title={t('stats.kills')} value={t(overall.kills)} color="§6" />
        <Table.td title={t('stats.deaths')} value={t(overall.deaths)} color="§b" />
      </Table.tr>
      <Table.tr>
        <ZombiesMapColumn title="Dead End" stats={deadEnd} t={t} />
        <ZombiesMapColumn title="Bad Blood" stats={badBlood} t={t} />
        <ZombiesMapColumn title="Alien Arcadium" stats={alienArcadium} t={t} />
      </Table.tr>
    </Table.table>
  );
};
