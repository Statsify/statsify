import { Table } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { UHCDuels, UHCDuelsMode } from '@statsify/schemas';
import { prettify } from '@statsify/util';

interface UHCDuelsModeTableProps {
  stats: UHCDuelsMode;
  title: string;
  t: LocalizeFunction;
}

const UHCDuelsModeTable: JSX.FC<UHCDuelsModeTableProps> = ({ title, stats, t }) => (
  <Table.table width="1/5">
    <Table.ts title={`§6${prettify(title)}`}>
      <Table.td title={t('stats.wins')} value={t(stats.wins)} color="§a" />
      <Table.td title={t('stats.losses')} value={t(stats.losses)} color="§c" />
      <Table.td title={t('stats.wlr')} value={t(stats.wlr)} color="§6" />
      <Table.td title={t('stats.kdr')} value={t(stats.kdr)} color="§b" />
    </Table.ts>
  </Table.table>
);

export interface UHCDuelsTableProps {
  stats: UHCDuels;
  t: LocalizeFunction;
}

export const UHCDuelsTable: JSX.FC<UHCDuelsTableProps> = ({ stats, t }) => {
  const modes = ['overall', 'solo', 'doubles', 'fours', 'deathmatch'] as const;

  return (
    <div width="100%">
      {modes.map((mode) => (
        <UHCDuelsModeTable title={mode} stats={stats[mode]} t={t} />
      ))}
    </div>
  );
};
