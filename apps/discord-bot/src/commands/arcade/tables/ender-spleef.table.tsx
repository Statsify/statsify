import { Table } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { EnderSpleef } from '@statsify/schemas';

interface EnderSpleefTableProps {
  stats: EnderSpleef;
  t: LocalizeFunction;
}

export const EnderSpleefTable = ({ stats, t }: EnderSpleefTableProps) => (
  <Table.table>
    <Table.tr>
      <Table.td title={t('stats.wins')} value={t(stats.wins)} color="§e" />
      <Table.td title={t('stats.blocksBroken')} value={t(stats.blocksBroken)} color="§a" />
      <Table.td
        title={t('stats.powerupActivations')}
        value={t(stats.powerupActivations)}
        color="§b"
      />
    </Table.tr>
  </Table.table>
);
