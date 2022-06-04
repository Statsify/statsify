import { Table } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { Zombies, ZombiesMap } from '@statsify/schemas';
import { formatTime } from '@statsify/util';

interface ZombiesTableProps {
  stats: Zombies;
  t: LocalizeFunction;
}

interface ZombiesMapTableProps {
  title: string;
  stats: [string, string][];
}

const ZombiesMapTable: JSX.FC<ZombiesMapTableProps> = ({ title, stats }) => {
  const colors = ['§a', '§c', '§6'];

  return (
    <Table.table width="1/3">
      <Table.ts title={`§6${title}`}>
        {stats.map(([title, value], index) => (
          <Table.td title={title} value={value} color={colors[index]} size="small" />
        ))}
      </Table.ts>
    </Table.table>
  );
};

const mapStat = (map: ZombiesMap, t: LocalizeFunction): [string, string] => {
  if (map.wins > 0) {
    return [t('stats.fastestWin'), formatTime(map.fastestWin * 1000, { short: true })];
  } else {
    return [t('stats.bestRound'), t(map.bestRound)];
  }
};

export const ZombiesTable: JSX.FC<ZombiesTableProps> = ({ stats, t }) => {
  const { overall, deadEnd, badBlood, alienArcadium } = stats;

  return (
    <div direction="column" width="100%">
      <Table.table width="remaining">
        <Table.tr>
          <Table.td title={t('stats.wins')} value={t(overall.wins)} color="§a" />
          <Table.td title={t('stats.doorsOpened')} value={t(overall.doorsOpened)} color="§e" />
          <Table.td title={t('stats.kills')} value={t(overall.kills)} color="§6" />
          <Table.td title={t('stats.deaths')} value={t(overall.deaths)} color="§b" />
        </Table.tr>
      </Table.table>
      <div direction="row" width="100%">
        <ZombiesMapTable
          title="Dead End"
          stats={[[t('stats.wins'), t(deadEnd.wins)], mapStat(deadEnd, t)]}
        />

        <ZombiesMapTable
          title="Bad Blood"
          stats={[[t('stats.wins'), t(badBlood.wins)], mapStat(badBlood, t)]}
        />

        <ZombiesMapTable
          title="Alien Arcadium"
          stats={[[t('stats.wins'), t(alienArcadium.wins)], mapStat(alienArcadium, t)]}
        />
      </div>
    </div>
  );
};
