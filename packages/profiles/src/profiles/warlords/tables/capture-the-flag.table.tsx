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

export interface WarlordsCaptureTheFlagTableProps {
  warlords: Warlords;
  t: LocalizeFunction;
}

export const WarlordsCaptureTheFlagTable = ({ warlords, t }: WarlordsCaptureTheFlagTableProps) => (
  <Table.table>
    <Table.tr>
      <Table.td title={t("stats.wins")} value={t(warlords.captureTheFlag.wins)} color={color("captureTheFlag.wins")} />
      <Table.td title={t("stats.kills")} value={t(warlords.captureTheFlag.kills)} color={color("captureTheFlag.kills")} />
    </Table.tr>
    <Table.tr>
      <Table.td title={t("stats.flagCaptures")} value={t(warlords.captureTheFlag.flagCaptures)} color={color("captureTheFlag.flagCaptures")} />
      <Table.td title={t("stats.flagReturns")} value={t(warlords.captureTheFlag.flagReturns)} color={color("captureTheFlag.flagReturns")} />
    </Table.tr>
  </Table.table>
);
