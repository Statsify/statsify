import { Table } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { Football } from '@statsify/schemas';

interface FootballTableProps {
  stats: Football;
  t: LocalizeFunction;
}

export const FootballTable: JSX.FC<FootballTableProps> = ({ stats, t }) => {
  return (
    <Table.table>
      <Table.tr>
        <Table.td title={t('stats.wins')} value={t(stats.wins)} color="§a" />
        <Table.td title={t('stats.goals')} value={t(stats.goals)} color="§e" />
      </Table.tr>
      <Table.tr>
        <Table.td title={t('stats.kicks')} value={t(stats.kicks)} color="§a" />
        <Table.td title={t('stats.powerKicks')} value={t(stats.powerKicks)} color="§e" />
      </Table.tr>
    </Table.table>
  );
};
