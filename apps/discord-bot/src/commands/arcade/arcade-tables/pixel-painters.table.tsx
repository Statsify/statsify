import { Table } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { PixelPainters } from '@statsify/schemas';

interface PixelPaintersTableProps {
  stats: PixelPainters;
  t: LocalizeFunction;
}

export const PixelPaintersTable: JSX.FC<PixelPaintersTableProps> = ({ stats, t }) => {
  return (
    <Table.table>
      <Table.tr>
        <Table.td title={t('stats.wins')} value={t(stats.wins)} color="§a" />
      </Table.tr>
    </Table.table>
  );
};
