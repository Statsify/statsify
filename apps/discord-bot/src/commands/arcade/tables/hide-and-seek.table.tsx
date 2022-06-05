import { Table } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { HideAndSeek } from '@statsify/schemas';

interface HideAndSeekTableProps {
  stats: HideAndSeek;
  t: LocalizeFunction;
}

export const HideAndSeekTable = ({ stats, t }: HideAndSeekTableProps) => {
  const { partyPooper, propHunt, overall } = stats;

  return (
    <Table.table>
      <Table.ts title="§6Overall">
        <Table.tr>
          <Table.td title={t('stats.wins')} value={t(overall.wins)} color="§a" />
          <Table.td title={t('stats.hiderWins')} value={t(overall.hiderWins)} color="§e" />
          <Table.td title={t('stats.seekerWins')} value={t(overall.seekerWins)} color="§b" />
        </Table.tr>
      </Table.ts>
      <Table.tr>
        <Table.ts title="§6Party Pooper">
          <Table.td title={t('stats.wins')} value={t(partyPooper.wins)} color="§a" />
          <Table.td title={t('stats.hiderWins')} value={t(partyPooper.hiderWins)} color="§e" />
          <Table.td title={t('stats.seekerWins')} value={t(partyPooper.seekerWins)} color="§b" />
        </Table.ts>
        <Table.ts title="§6Prop Hunt">
          <Table.td title={t('stats.wins')} value={t(propHunt.wins)} color="§a" />
          <Table.td title={t('stats.hiderWins')} value={t(propHunt.hiderWins)} color="§e" />
          <Table.td title={t('stats.seekerWins')} value={t(propHunt.seekerWins)} color="§b" />
        </Table.ts>
      </Table.tr>
    </Table.table>
  );
};
