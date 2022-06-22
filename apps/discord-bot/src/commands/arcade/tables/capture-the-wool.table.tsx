/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { CaptureTheWool } from "@statsify/schemas";
import { LocalizeFunction } from "@statsify/discord";
import { Table } from "#components";

interface CaptureTheWoolTableProps {
  stats: CaptureTheWool;
  t: LocalizeFunction;
}

export const CaptureTheWoolTable = ({ stats, t }: CaptureTheWoolTableProps) => {
  const colors = ["§b", "§e", "§6", "§2"];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return (
    <Table.table>
      <Table.tr>
        <Table.td title={t("stats.kills")} value={t(stats.kills)} color="§a" />
        <Table.td
          title={t("stats.woolCaptures")}
          value={t(stats.captures)}
          color={color}
        />
      </Table.tr>
    </Table.table>
  );
};
