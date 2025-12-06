/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Arcade } from "@statsify/schemas";
import { LocalizeFunction } from "@statsify/discord";
import { Table } from "#components";
import { arcadeWins } from "../wins.js";
import { arrayGroup } from "@statsify/util";

interface OverallArcadeTableProps {
  stats: Arcade;
  t: LocalizeFunction;
}

export const OverallArcadeTable = ({ stats, t }: OverallArcadeTableProps) => {
  const rowSize = 3;

  const rows = arrayGroup(arcadeWins(stats), rowSize);

  const colors = ["§d", "§b", "§a", "§e", "§6", "§c"];

  return (
    <Table.table>
      {rows.map((row, index) => (
        <Table.tr>
          {row.map((game) => (
            <Table.td title={game[0]} value={t(game[1])} color={colors[index]} />
          ))}
        </Table.tr>
      ))}
    </Table.table>
  );
};
