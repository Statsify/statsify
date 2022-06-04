import { Table } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { HoleInTheWall } from '@statsify/schemas';

interface HoleInTheWallTableProps {
  stats: HoleInTheWall;
  t: LocalizeFunction;
}

export const HoleInTheWallTable: JSX.FC<HoleInTheWallTableProps> = ({ stats, t }) => {
  return (
    <Table.table>
      <Table.tr>
        <Table.td title={t('stats.wins')} value={t(stats.wins)} color="§a" />
        <Table.td title={t('stats.wallsFaced')} value={t(stats.wallsFaced)} color="§e" />
      </Table.tr>
      <Table.tr>
        <Table.td
          title={t('stats.highestScoreQualifications')}
          value={t(stats.highestScoreQualifications)}
          color="§a"
        />
        <Table.td
          title={t('stats.highestScoreFinals')}
          value={t(stats.highestScoreFinals)}
          color="§e"
        />
      </Table.tr>
    </Table.table>
  );
};
