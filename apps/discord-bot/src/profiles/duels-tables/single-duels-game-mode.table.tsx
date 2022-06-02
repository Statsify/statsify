import { If, Table } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { SingleDuelsGameMode } from '@statsify/schemas';

interface SingleDuelsGameModeTableProps {
  stats: SingleDuelsGameMode;
  t: LocalizeFunction;
}

export const SingleDuelsGameModeTable: JSX.FC<SingleDuelsGameModeTableProps> = ({ stats, t }) => {
  return (
    <Table.table>
      <If condition={stats.bestWinstreak}>
        <Table.tr>
          <Table.td title={t('stats.winstreak')} value={t(stats.winstreak)} color="§e" />
          <Table.td title={t('stats.bestWinstreak')} value={t(stats.bestWinstreak)} color="§e" />
        </Table.tr>
      </If>
      <Table.tr>
        <Table.td title={t('stats.wins')} value={t(stats.wins)} color="§a" />
        <Table.td title={t('stats.losses')} value={t(stats.losses)} color="§c" />
        <Table.td title={t('stats.wlr')} value={t(stats.wlr)} color="§6" />
      </Table.tr>
      <Table.tr>
        <Table.td title={t('stats.kills')} value={t(stats.kills)} color="§a" />
        <Table.td title={t('stats.deaths')} value={t(stats.deaths)} color="§c" />
        <Table.td title={t('stats.kdr')} value={t(stats.kdr)} color="§6" />
      </Table.tr>
    </Table.table>
  );
};
