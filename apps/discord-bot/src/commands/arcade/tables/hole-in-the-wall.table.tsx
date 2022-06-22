/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { HoleInTheWall } from "@statsify/schemas";
import { LocalizeFunction } from "@statsify/discord";
import { Table } from "#components";

interface HoleInTheWallTableProps {
  stats: HoleInTheWall;
  t: LocalizeFunction;
}

export const HoleInTheWallTable = ({ stats, t }: HoleInTheWallTableProps) => (
  <Table.table>
    <Table.tr>
      <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§a" />
      <Table.td title={t("stats.wallsFaced")} value={t(stats.wallsFaced)} color="§c" />
    </Table.tr>
    <Table.tr>
      <Table.td
        title={t("stats.highestScoreQualifications")}
        value={t(stats.highestScoreQualifications)}
        color="§b"
      />
      <Table.td
        title={t("stats.highestScoreFinals")}
        value={t(stats.highestScoreFinals)}
        color="§6"
      />
    </Table.tr>
  </Table.table>
);
