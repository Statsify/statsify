import { Table } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { PartyGames } from '@statsify/schemas';

interface PartyGamesTableProps {
  stats: PartyGames;
  t: LocalizeFunction;
}

export const PartyGamesTable = ({ stats, t }: PartyGamesTableProps) => (
  <Table.table>
    <Table.tr>
      <Table.td title={t('stats.wins')} value={t(stats.wins)} color="§a" />
      <Table.td title={t('stats.starsEarned')} value={t(stats.starsEarned)} color="§e" />
      <Table.td title={t('stats.roundWins')} value={t(stats.roundsWon)} color="§b" />
    </Table.tr>
  </Table.table>
);
