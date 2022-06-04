import { Table } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { Seasonal } from '@statsify/schemas';

interface SeasonalTableProps {
  stats: Seasonal;
  t: LocalizeFunction;
}

interface SeasonalGameTableProps {
  title: string;
  stats: [string, string][];
  width: JSX.Measurement;
}

const SeasonalGameTable: JSX.FC<SeasonalGameTableProps> = ({ title, stats, width }) => {
  const colors = ['§a', '§c', '§6'];

  return (
    <Table.table width={width}>
      <Table.ts title={`§6${title}`}>
        {stats.map(([title, value], index) => (
          <Table.td title={title} value={value} color={colors[index]} size="regular" />
        ))}
      </Table.ts>
    </Table.table>
  );
};

export const SeasonalTable: JSX.FC<SeasonalTableProps> = ({ stats, t }) => {
  return (
    <div direction="column" width="100%">
      <div direction="row" width="100%">
        <SeasonalGameTable
          title="Easter Simulator"
          width="1/3"
          stats={[
            [t('stats.wins'), t(stats.easterSimulator.wins)],
            [t('stats.eggsFound'), t(stats.easterSimulator.eggsFound)],
          ]}
        />

        <SeasonalGameTable
          title="Grinch Simulator"
          width="1/3"
          stats={[
            [t('stats.wins'), t(stats.grinchSimulator.wins)],
            [t('stats.giftsFound'), t(stats.grinchSimulator.giftsFound)],
          ]}
        />

        <SeasonalGameTable
          title="Halloween Simulator"
          width="1/3"
          stats={[
            [t('stats.wins'), t(stats.halloweenSimulator.wins)],
            [t('stats.candyFound'), t(stats.halloweenSimulator.candyFound)],
          ]}
        />
      </div>
      <div direction="row" width="100%">
        <SeasonalGameTable
          title="Santa Simulator"
          width="1/2"
          stats={[
            [t('stats.wins'), t(stats.santaSimulator.wins)],
            [t('stats.delivered'), t(stats.santaSimulator.delivered)],
          ]}
        />

        <SeasonalGameTable
          title="Scuba Simulator"
          width="1/2"
          stats={[
            [t('stats.wins'), t(stats.scubaSimulator.wins)],
            [t('stats.points'), t(stats.scubaSimulator.points)],
          ]}
        />
      </div>
    </div>
  );
};
