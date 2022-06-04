import { Table } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { HypixelSays } from '@statsify/schemas';

interface HypixelSaysTableProps {
  stats: HypixelSays;
  t: LocalizeFunction;
}

export const HypixelSaysTable: JSX.FC<HypixelSaysTableProps> = ({ stats, t }) => {
  return (
    <Table.table>
      <Table.tr>
        <Table.td title={t('stats.wins')} value={t(stats.wins)} color="§a" />
        <Table.td title={t('stats.points')} value={t(stats.points)} color="§e" />
        <Table.td title={t('stats.roundWins')} value={t(stats.roundsWon)} color="§b" />
      </Table.tr>
    </Table.table>
  );
};
