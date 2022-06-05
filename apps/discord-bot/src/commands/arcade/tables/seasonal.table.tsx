import { Table } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { Seasonal } from '@statsify/schemas';

interface SeasonalTableProps {
  stats: Seasonal;
  t: LocalizeFunction;
}

interface SeasonalGameTableProps {
  title: string;
  stats: [string, string][];
}

const SeasonalGameTable = ({ title, stats }: SeasonalGameTableProps) => {
  const colors = ['§a', '§c', '§6'];

  return (
    <Table.ts title={`§6${title}`}>
      {stats.map(([title, value], index) => (
        <Table.td title={title} value={value} color={colors[index]} />
      ))}
    </Table.ts>
  );
};

export const SeasonalTable = ({ stats, t }: SeasonalTableProps) => (
  <Table.table>
    <Table.tr>
      <SeasonalGameTable
        title="Easter Simulator"
        stats={[
          [t('stats.wins'), t(stats.easterSimulator.wins)],
          [t('stats.eggsFound'), t(stats.easterSimulator.eggsFound)],
        ]}
      />

      <SeasonalGameTable
        title="Grinch Simulator"
        stats={[
          [t('stats.wins'), t(stats.grinchSimulator.wins)],
          [t('stats.giftsFound'), t(stats.grinchSimulator.giftsFound)],
        ]}
      />

      <SeasonalGameTable
        title="Halloween Simulator"
        stats={[
          [t('stats.wins'), t(stats.halloweenSimulator.wins)],
          [t('stats.candyFound'), t(stats.halloweenSimulator.candyFound)],
        ]}
      />
    </Table.tr>
    <Table.tr>
      <SeasonalGameTable
        title="Santa Simulator"
        stats={[
          [t('stats.wins'), t(stats.santaSimulator.wins)],
          [t('stats.delivered'), t(stats.santaSimulator.delivered)],
        ]}
      />

      <SeasonalGameTable
        title="Scuba Simulator"
        stats={[
          [t('stats.wins'), t(stats.scubaSimulator.wins)],
          [t('stats.points'), t(stats.scubaSimulator.points)],
        ]}
      />
    </Table.tr>
  </Table.table>
);
