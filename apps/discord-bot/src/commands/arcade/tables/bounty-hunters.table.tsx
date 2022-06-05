import { Table } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { BountyHunters } from '@statsify/schemas';

interface BountyHuntersTableProps {
  stats: BountyHunters;
  t: LocalizeFunction;
}

export const BountyHuntersTable = ({ stats, t }: BountyHuntersTableProps) => (
  <Table.table>
    <Table.tr>
      <Table.td title={t('stats.wins')} value={t(stats.wins)} color="§a" />
      <Table.td title={t('stats.bountyKills')} value={t(stats.bountyKills)} color="§b" />
    </Table.tr>
    <Table.tr>
      <Table.td title={t('stats.kills')} value={t(stats.kills)} color="§a" />
      <Table.td title={t('stats.deaths')} value={t(stats.deaths)} color="§b" />
      <Table.td title={t('stats.kdr')} value={t(stats.kdr)} color="§e" />
    </Table.tr>
  </Table.table>
);
