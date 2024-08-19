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

export interface WarlordsCaptureTheFlagTableProps {
  warlords: Warlords;
  t: LocalizeFunction;
}

export const WarlordsCaptureTheFlagTable = ({ warlords, t }: WarlordsCaptureTheFlagTableProps) => (
  <Table.table>
    <Table.tr>
      <Table.td title={t("stats.wins")} value={t(warlords.captureTheFlag.wins)} color="§a" />
      <Table.td title={t("stats.kills")} value={t(warlords.captureTheFlag.kills)} color="§e" />
    </Table.tr>
    <Table.tr>
      <Table.td title={t("stats.flagCaptures")} value={t(warlords.captureTheFlag.flagCaptures)} color="§c" />
      <Table.td title={t("stats.flagReturns")} value={t(warlords.captureTheFlag.flagReturns)} color="§9" />
    </Table.tr>
  </Table.table>
);
