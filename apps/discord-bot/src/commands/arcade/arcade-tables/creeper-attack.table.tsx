import { Table } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { CreeperAttack } from '@statsify/schemas';

interface CreeperAttackTableProps {
  stats: CreeperAttack;
  t: LocalizeFunction;
}

export const CreeperAttackTable: JSX.FC<CreeperAttackTableProps> = ({ stats, t }) => {
  return (
    <Table.table>
      <Table.tr>
        <Table.td title={t('stats.maxWave')} value={t(stats.maxWave)} color="§a" />
      </Table.tr>
    </Table.table>
  );
};
