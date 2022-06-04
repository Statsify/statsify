import { Table } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { DragonWars } from '@statsify/schemas';

interface DragonWarsTableProps {
  stats: DragonWars;
  t: LocalizeFunction;
}

export const DragonWarsTable: JSX.FC<DragonWarsTableProps> = ({ stats, t }) => {
  return (
    <Table.table>
      <Table.tr>
        <Table.td title={t('stats.wins')} value={t(stats.wins)} color="§e" />
        <Table.td title={t('stats.kills')} value={t(stats.kills)} color="§a" />
      </Table.tr>
    </Table.table>
  );
};
