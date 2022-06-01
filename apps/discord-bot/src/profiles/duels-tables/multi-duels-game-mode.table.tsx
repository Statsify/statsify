import { If, Table } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { BaseDuelsGameMode, MultiDuelsGameMode } from '@statsify/schemas';
import { prettify } from '@statsify/util';

interface MultiDuelsGameModeModeTableProps {
  stats: BaseDuelsGameMode;
  title: string;
  t: LocalizeFunction;
}

const MultiDuelsGameModeModeTable: JSX.FC<MultiDuelsGameModeModeTableProps> = ({
  title,
  stats,
  t,
}) => {
  return (
    <Table.table width="1/3">
      <Table.ts title={`§6${prettify(title)}`}>
        <If condition={Boolean(stats.bestWinstreak)}>
          <Table.tr>
            <Table.td title={t('stats.winstreak')} value={t(stats.winstreak)} color="§e" />
            <Table.td title={t('stats.bestWinstreak')} value={t(stats.bestWinstreak)} color="§e" />
          </Table.tr>
        </If>
        <Table.tr>
          <Table.td title={t('stats.wins')} value={t(stats.wins)} color="§a" />
          <Table.td title={t('stats.kills')} value={t(stats.kills)} color="§a" />
        </Table.tr>
        <Table.tr>
          <Table.td title={t('stats.losses')} value={t(stats.losses)} color="§c" />
          <Table.td title={t('stats.deaths')} value={t(stats.deaths)} color="§c" />
        </Table.tr>
        <Table.tr>
          <Table.td title={t('stats.wlr')} value={t(stats.wlr)} color="§6" />
          <Table.td title={t('stats.kdr')} value={t(stats.kdr)} color="§6" />
        </Table.tr>
      </Table.ts>
    </Table.table>
  );
};

interface MultiDuelsGameModeTableProps {
  stats: MultiDuelsGameMode;
  t: LocalizeFunction;
}

export const MultiDuelsGameModeTable: JSX.FC<MultiDuelsGameModeTableProps> = ({ stats, t }) => {
  const modes = ['overall', 'solo', 'doubles'] as const;

  return (
    <div width="100%">
      {modes.map((mode) => (
        <MultiDuelsGameModeModeTable title={mode} stats={stats[mode]} t={t} />
      ))}
    </div>
  );
};
