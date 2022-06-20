/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Table } from '#components';
import { LocalizeFunction } from '@statsify/discord';
import { EnderSpleef } from '@statsify/schemas';

interface EnderSpleefTableProps {
  stats: EnderSpleef;
  t: LocalizeFunction;
}

export const EnderSpleefTable = ({ stats, t }: EnderSpleefTableProps) => (
  <Table.table>
    <Table.tr>
      <Table.td title={t('stats.wins')} value={t(stats.wins)} color="§a" />
      <Table.td title={t('stats.blocksBroken')} value={t(stats.blocksBroken)} color="§c" />
      <Table.td
        title={t('stats.powerupActivations')}
        value={t(stats.powerupActivations)}
        color="§6"
      />
    </Table.tr>
  </Table.table>
);
