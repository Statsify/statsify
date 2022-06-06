import { Table } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { CaptureTheWool } from '@statsify/schemas';

interface CaptureTheWoolTableProps {
  stats: CaptureTheWool;
  t: LocalizeFunction;
}

export const CaptureTheWoolTable = ({ stats, t }: CaptureTheWoolTableProps) => {
  const colors = ['§b', '§e', '§6', '§2'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return (
    <Table.table>
      <Table.tr>
        <Table.td title={t('stats.kills')} value={t(stats.kills)} color="§a" />
        <Table.td title={t('stats.woolCaptures')} value={t(stats.captures)} color={color} />
      </Table.tr>
    </Table.table>
  );
};
