/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Historical, Table } from "#components";
import { HoleInTheWall } from "@statsify/schemas";
import { LocalizeFunction } from "@statsify/discord";
import type { ProfileTime } from "#commands/base.hypixel-command";

interface HoleInTheWallTableProps {
  stats: HoleInTheWall;
  t: LocalizeFunction;
  time: ProfileTime;
}

export const HoleInTheWallTable = ({ stats, t, time }: HoleInTheWallTableProps) => (
  <Table.table>
    <Table.tr>
      <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§a" />
      <Table.td title={t("stats.wallsFaced")} value={t(stats.wallsFaced)} color="§c" />
    </Table.tr>
    <Historical.exclude time={time}>
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
    </Historical.exclude>
  </Table.table>
);
