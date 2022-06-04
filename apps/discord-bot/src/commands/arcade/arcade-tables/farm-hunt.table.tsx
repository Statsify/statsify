import { Table } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { FarmHunt } from '@statsify/schemas';

interface FarmHuntTableProps {
  stats: FarmHunt;
  t: LocalizeFunction;
}

export const FarmHuntTable: JSX.FC<FarmHuntTableProps> = ({ stats, t }) => {
  return (
    <Table.table>
      <Table.tr>
        <Table.td title={t('stats.wins')} value={t(stats.wins)} color="§a" />
        <Table.td title={t('stats.animalWins')} value={t(stats.animalWins)} color="§e" />
        <Table.td title={t('stats.hunterWins')} value={t(stats.hunterWins)} color="§b" />
      </Table.tr>
      <Table.tr>
        <Table.td title={t('stats.kills')} value={t(stats.kills)} color="§a" />
        <Table.td title={t('stats.animalKills')} value={t(stats.animalKills)} color="§e" />
        <Table.td title={t('stats.hunterKills')} value={t(stats.hunterKills)} color="§b" />
      </Table.tr>
      <Table.tr>
        <Table.td title={t('stats.tauntsUsed')} value={t(stats.tauntsUsed)} color="§a" />
        <Table.td title={t('stats.poopCollected')} value={t(stats.poopCollected)} color="§b" />
      </Table.tr>
    </Table.table>
  );
};
