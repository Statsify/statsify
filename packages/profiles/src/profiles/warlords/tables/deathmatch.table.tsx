/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Table } from "../../../components/index.js";
import { WARLORDS, cardColors } from "@statsify/catalog";
import type { LocalizeFunction } from "../../../types.js";
import type { Warlords } from "@statsify/schemas";

const color = cardColors(WARLORDS);

export interface WarlordsDeathmatchTableProps {
  warlords: Warlords;
  t: LocalizeFunction;
}

export const WarlordsDeathmatchTable = ({ warlords, t }: WarlordsDeathmatchTableProps) => (
  <Table.table>
    <Table.tr>
      <Table.td title={t("stats.wins")} value={t(warlords.teamDeathmatch.wins)} color={color("teamDeathmatch.wins")} />
      <Table.td title={t("stats.kills")} value={t(warlords.teamDeathmatch.kills)} color={color("teamDeathmatch.kills")} />
    </Table.tr>
  </Table.table>
);
