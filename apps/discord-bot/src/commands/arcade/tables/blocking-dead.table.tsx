import { Table } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { BlockingDead } from '@statsify/schemas';

interface BlockingDeadTableProps {
  stats: BlockingDead;
  t: LocalizeFunction;
}

export const BlockingDeadTable = ({ stats, t }: BlockingDeadTableProps) => (
  <Table.table>
    <Table.tr>
      <Table.td title={t('stats.wins')} value={t(stats.wins)} color="§a" />
      <Table.td title={t('stats.kills')} value={t(stats.kills)} color="§c" />
      <Table.td title={t('stats.headshots')} value={t(stats.headshots)} color="§b" />
    </Table.tr>
  </Table.table>
);
