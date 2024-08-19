/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Table } from "#components";
import type { LocalizeFunction } from "@statsify/discord";
import type { Warlords } from "@statsify/schemas";

export interface WarlordsDeathmatchTableProps {
  warlords: Warlords;
  t: LocalizeFunction;
}

export const WarlordsDeathmatchTable = ({ warlords, t }: WarlordsDeathmatchTableProps) => (
  <Table.table>
    <Table.tr>
      <Table.td title={t("stats.wins")} value={t(warlords.teamDeathmatch.wins)} color="§a" />
      <Table.td title={t("stats.kills")} value={t(warlords.teamDeathmatch.kills)} color="§e" />
    </Table.tr>
  </Table.table>
);
