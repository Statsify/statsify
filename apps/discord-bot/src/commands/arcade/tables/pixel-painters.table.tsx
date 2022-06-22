/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { LocalizeFunction } from "@statsify/discord";
import { PixelPainters } from "@statsify/schemas";
import { Table } from "#components";

interface PixelPaintersTableProps {
  stats: PixelPainters;
  t: LocalizeFunction;
}

export const PixelPaintersTable = ({ stats, t }: PixelPaintersTableProps) => (
  <Table.table>
    <Table.tr>
      <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§a" />
    </Table.tr>
  </Table.table>
);
