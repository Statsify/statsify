import { Table } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { JSX } from '@statsify/rendering';
import { BridgeDuels, BridgeDuelsMode } from '@statsify/schemas';
import { prettify } from '@statsify/util';

interface BridgeDuelsModeTableProps {
  stats: BridgeDuelsMode;
  title: string;
  t: LocalizeFunction;
}

const BridgeDuelsModeTable: JSX.FC<BridgeDuelsModeTableProps> = ({ title, stats, t }) => (
  <Table.table width="1/4">
    <Table.ts title={`§6${prettify(title)}`}>
      <Table.td title={t('stats.wins')} value={t(stats.wins)} color="§a" />
      <Table.td title={t('stats.losses')} value={t(stats.losses)} color="§c" />
      <Table.td title={t('stats.wlr')} value={t(stats.wlr)} color="§b" />
    </Table.ts>
  </Table.table>
);

export interface BridgeDuelsTableProps {
  stats: BridgeDuels;
  t: LocalizeFunction;
}

export const BridgeDuelsTable: JSX.FC<BridgeDuelsTableProps> = ({ stats, t }) => {
  const firstModes = ['overall', 'solo', 'doubles', 'threes'] as const;
  const secondModes = ['fours', '2v2v2v2', '3v3v3v3', 'ctf'] as const;

  return (
    <div width="100%" direction="column">
      <div width="100%">
        {firstModes.map((mode) => (
          <BridgeDuelsModeTable title={mode} stats={stats[mode]} t={t} />
        ))}
      </div>
      <div width="100%">
        {secondModes.map((mode) => (
          <BridgeDuelsModeTable title={mode} stats={stats[mode]} t={t} />
        ))}
      </div>
    </div>
  );
};
