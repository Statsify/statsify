/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ARCADE, cardColours } from "@statsify/catalog";
import { Historical, Table } from "../../../components/index.js";
import { HoleInTheWall } from "@statsify/schemas";
import type { LocalizeFunction, ProfileTime } from "../../../types.js";

const colour = cardColours(ARCADE, "holeInTheWall");

interface HoleInTheWallTableProps {
  stats: HoleInTheWall;
  t: LocalizeFunction;
  time: ProfileTime;
}

export const HoleInTheWallTable = ({ stats, t, time }: HoleInTheWallTableProps) => (
  <Table.table>
    <Table.tr>
      <Table.td title={t("stats.wins")} value={t(stats.wins)} color={colour("wins")} />
      <Table.td title={t("stats.wallsFaced")} value={t(stats.wallsFaced)} color={colour("wallsFaced")} />
    </Table.tr>
    <Historical.exclude time={time}>
      <Table.tr>
        <Table.td
          title={t("stats.highestScoreQualifications")}
          value={t(stats.highestScoreQualifications)}
          color={colour("highestScoreQualifications")}
        />
        <Table.td
          title={t("stats.highestScoreFinals")}
          value={t(stats.highestScoreFinals)}
          color={colour("highestScoreFinals")}
        />
      </Table.tr>
    </Historical.exclude>
  </Table.table>
);
