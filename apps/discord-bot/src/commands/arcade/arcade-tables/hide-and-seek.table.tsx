import { Table } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { HideAndSeek } from '@statsify/schemas';

interface HideAndSeekTableProps {
  stats: HideAndSeek;
  t: LocalizeFunction;
}

export const HideAndSeekTable: JSX.FC<HideAndSeekTableProps> = ({ stats, t }) => {
  const { partyPooper, propHunt, overall } = stats;

  return (
    <div direction="column" width="100%">
      <Table.table width="remaining">
        <Table.tr>
          <Table.td title={t('stats.wins')} value={t(overall.wins)} color="§a" />
          <Table.td title={t('stats.hiderWins')} value={t(overall.hiderWins)} color="§e" />
          <Table.td title={t('stats.seekerWins')} value={t(overall.seekerWins)} color="§b" />
        </Table.tr>
      </Table.table>
      <div direction="row" width="100%">
        <Table.table width="1/2">
          <Table.ts title="Party Pooper">
            <Table.td title={t('stats.wins')} value={t(partyPooper.wins)} color="§a" />
            <Table.td title={t('stats.hiderWins')} value={t(partyPooper.hiderWins)} color="§e" />
            <Table.td title={t('stats.seekerWins')} value={t(partyPooper.seekerWins)} color="§b" />
          </Table.ts>
        </Table.table>
        <Table.table width="1/2">
          <Table.ts title="Prop Hunt">
            <Table.td title={t('stats.wins')} value={t(propHunt.wins)} color="§a" />
            <Table.td title={t('stats.hiderWins')} value={t(propHunt.hiderWins)} color="§e" />
            <Table.td title={t('stats.seekerWins')} value={t(propHunt.seekerWins)} color="§b" />
          </Table.ts>
        </Table.table>
      </div>
    </div>
  );
};
