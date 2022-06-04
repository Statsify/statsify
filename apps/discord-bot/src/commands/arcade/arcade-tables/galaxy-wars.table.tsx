import { Table } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { GalaxyWars } from '@statsify/schemas';

interface GalaxyWarsTableProps {
  stats: GalaxyWars;
  t: LocalizeFunction;
}

export const GalaxyWarsTable: JSX.FC<GalaxyWarsTableProps> = ({ stats, t }) => {
  return (
    <Table.table>
      <Table.tr>
        <Table.td title={t('stats.wins')} value={t(stats.wins)} color="§a" />
        <Table.td title={t('stats.kills')} value={t(stats.kills)} color="§e" />
        <Table.td title={t('stats.deaths')} value={t(stats.deaths)} color="§c" />
      </Table.tr>
      <Table.tr>
        <Table.td title={t('stats.empireKills')} value={t(stats.empireKills)} color="§a" />
        <Table.td title={t('stats.rebelKills')} value={t(stats.rebelKills)} color="§e" />
        <Table.td title={t('stats.kdr')} value={t(stats.kdr)} color="§c" />
      </Table.tr>
    </Table.table>
  );
};
