import { Table } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { HoleInTheWall } from '@statsify/schemas';

interface HoleInTheWallTableProps {
  stats: HoleInTheWall;
  t: LocalizeFunction;
}

export const HoleInTheWallTable = ({ stats, t }: HoleInTheWallTableProps) => {
  return (
    <Table.table>
      <Table.tr>
        <Table.td title={t('stats.wins')} value={t(stats.wins)} color="§a" />
        <Table.td title={t('stats.wallsFaced')} value={t(stats.wallsFaced)} color="§c" />
      </Table.tr>
      <Table.tr>
        <Table.td
          title={t('stats.highestScoreQualifications')}
          value={t(stats.highestScoreQualifications)}
          color="§b"
        />
        <Table.td
          title={t('stats.highestScoreFinals')}
          value={t(stats.highestScoreFinals)}
          color="§6"
        />
      </Table.tr>
    </Table.table>
  );
};
