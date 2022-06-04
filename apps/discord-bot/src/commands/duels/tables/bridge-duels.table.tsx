import { Table } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { BridgeDuels, BridgeDuelsMode } from '@statsify/schemas';
import { prettify } from '@statsify/util';

interface BridgeDuelsModeColumnProps {
  stats: BridgeDuelsMode;
  title: string;
  t: LocalizeFunction;
}

const BridgeDuelsModeColumn = ({ title, stats, t }: BridgeDuelsModeColumnProps) => (
  <Table.ts title={`§6${prettify(title)}`}>
    <Table.td title={t('stats.wins')} value={t(stats.wins)} color="§a" />
    <Table.td title={t('stats.losses')} value={t(stats.losses)} color="§c" />
    <Table.td title={t('stats.wlr')} value={t(stats.wlr)} color="§b" />
  </Table.ts>
);

export interface BridgeDuelsTableProps {
  stats: BridgeDuels;
  t: LocalizeFunction;
}

export const BridgeDuelsTable = ({ stats, t }: BridgeDuelsTableProps) => {
  const firstModes = ['overall', 'solo', 'doubles', 'threes'] as const;
  const secondModes = ['fours', '2v2v2v2', '3v3v3v3', 'ctf'] as const;

  return (
    <Table.table>
      <Table.tr>
        {firstModes.map((mode) => (
          <BridgeDuelsModeColumn title={mode} stats={stats[mode]} t={t} />
        ))}
      </Table.tr>
      <Table.tr>
        {secondModes.map((mode) => (
          <BridgeDuelsModeColumn title={mode} stats={stats[mode]} t={t} />
        ))}
      </Table.tr>
    </Table.table>
  );
};
