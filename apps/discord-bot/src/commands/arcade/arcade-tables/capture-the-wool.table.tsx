import { Table } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { CaptureTheWool } from '@statsify/schemas';

interface CaptureTheWoolTableProps {
  stats: CaptureTheWool;
  t: LocalizeFunction;
}

export const CaptureTheWoolTable: JSX.FC<CaptureTheWoolTableProps> = ({ stats, t }) => {
  return (
    <Table.table>
      <Table.tr>
        <Table.td title={t('stats.kills')} value={t(stats.kills)} color="§a" />
        <Table.td title={t('stats.woolCaptures')} value={t(stats.captures)} color="§e" />
      </Table.tr>
    </Table.table>
  );
};
