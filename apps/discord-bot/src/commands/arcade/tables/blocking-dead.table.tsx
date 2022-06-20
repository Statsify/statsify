/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Table } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { BlockingDead } from '@statsify/schemas';

interface BlockingDeadTableProps {
  stats: BlockingDead;
  t: LocalizeFunction;
}

export const BlockingDeadTable = ({ stats, t }: BlockingDeadTableProps) => (
  <Table.table>
    <Table.tr>
      <Table.td title={t('stats.wins')} value={t(stats.wins)} color="§e" />
      <Table.td title={t('stats.kills')} value={t(stats.kills)} color="§a" />
      <Table.td title={t('stats.headshots')} value={t(stats.headshots)} color="§6" />
    </Table.tr>
  </Table.table>
);
