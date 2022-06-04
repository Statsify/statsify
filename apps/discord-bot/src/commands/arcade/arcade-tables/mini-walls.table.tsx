import { Table } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { MiniWalls } from '@statsify/schemas';
import { prettify } from '@statsify/util';

interface MiniWallsTableProps {
  stats: MiniWalls;
  t: LocalizeFunction;
}

export const MiniWallsTable: JSX.FC<MiniWallsTableProps> = ({ stats, t }) => {
  return (
    <Table.table>
      <Table.tr>
        <Table.td title={t('stats.wins')} value={t(stats.wins)} color="§a" />
        <Table.td
          title={t('stats.bowAccuracy')}
          value={`${t(stats.bowAccuracy * 100)}%`}
          color="§c"
        />
        <Table.td title={t('stats.kit')} value={prettify(stats.kit)} color="§e" />
      </Table.tr>
      <Table.tr>
        <Table.td title={t('stats.kills')} value={t(stats.kills)} color="§a" />
        <Table.td title={t('stats.deaths')} value={t(stats.deaths)} color="§c" />
        <Table.td title={t('stats.kdr')} value={t(stats.kdr)} color="§e" />
      </Table.tr>
      <Table.tr>
        <Table.td title={t('stats.finalKills')} value={t(stats.finalKills)} color="§a" />
        <Table.td title={t('stats.witherDamage')} value={t(stats.witherDamage)} color="§c" />
        <Table.td title={t('stats.witherKills')} value={t(stats.witherKills)} color="§e" />
      </Table.tr>
    </Table.table>
  );
};
