/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ARCADE, cardColors } from "@statsify/catalog";
import { CreeperAttack } from "@statsify/schemas";
import { LocalizeFunction } from "../../../types.js";
import { Table } from "../../../components/index.js";

const color = cardColors(ARCADE, "creeperAttack");

interface CreeperAttackTableProps {
  stats: CreeperAttack;
  t: LocalizeFunction;
}

export const CreeperAttackTable = ({ stats, t }: CreeperAttackTableProps) => (
  <Table.table>
    <Table.tr>
      <Table.td title={t("stats.maxWave")} value={t(stats.maxWave)} color={color("maxWave")} />
    </Table.tr>
  </Table.table>
);
