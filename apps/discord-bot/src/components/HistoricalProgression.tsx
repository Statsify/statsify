import { HistoricalType } from '@statsify/api-client';
import { LocalizeFunction } from '@statsify/discord';
import { Progression } from '@statsify/schemas';
import { formatProgression } from './Header';
import { If } from './If';
import { Table } from './Table';

export interface HistoricalProgressionProps {
  progression: Progression;
  t: LocalizeFunction;
  level: number;
  exp: number;
  current: string;
  next: string;
  time: 'LIVE' | HistoricalType;
}

export const HistoricalProgression = ({
  progression,
  t,
  level,
  exp,
  current,
  next,
  time,
}: HistoricalProgressionProps) => {
  return (
    <If condition={time !== 'LIVE'}>
      <>
        <Table.tr>
          <Table.td title={t('stats.levelsGained')} value={t(level)} color="§b" size="small" />
          <Table.td title={t('stats.expGained')} value={t(exp)} color="§b" size="small" />
        </Table.tr>
        <Table.tr>
          <box width="100%">
            <text>{formatProgression(t, progression, current, next, false)}</text>
          </box>
        </Table.tr>
      </>
    </If>
  );
};