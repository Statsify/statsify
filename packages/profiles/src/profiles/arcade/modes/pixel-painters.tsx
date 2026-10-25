/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ARCADE, cardColours } from "@statsify/catalog";
import type { LocalizeFunction } from "../../../types.js";
import { PixelPainters } from "@statsify/schemas";
import { Table } from "../../../components/index.js";

const colour = cardColours(ARCADE, "pixelPainters");

interface PixelPaintersTableProps {
  stats: PixelPainters;
  t: LocalizeFunction;
}

export const PixelPaintersTable = ({ stats, t }: PixelPaintersTableProps) => (
  <Table.table>
    <Table.tr>
      <Table.td title={t("stats.wins")} value={t(stats.wins)} color={colour("wins")} />
    </Table.tr>
  </Table.table>
);
