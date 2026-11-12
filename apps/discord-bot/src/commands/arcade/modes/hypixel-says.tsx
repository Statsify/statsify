/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Historical, Table } from "#components";
import { HypixelSays } from "@statsify/schemas";
import { LocalizeFunction } from "@statsify/discord";
import type { ProfileTime } from "#commands/base.hypixel-command";

interface HypixelSaysTableProps {
  stats: HypixelSays;
  t: LocalizeFunction;
  time: ProfileTime;
}

export const HypixelSaysTable = ({ stats, t, time }: HypixelSaysTableProps) => (
  <Table.table>
    <Table.ts title="§6Hypixel Says">
      <Table.tr>
        <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§a" />
        <Table.td title={t("stats.roundWins")} value={t(stats.roundsWon)} color="§b" />
      </Table.tr>
      <Table.tr>
        <Table.td title={t("stats.points")} value={t(stats.points)} color="§e" />
        <Historical.exclude time={time}>
          <Table.td title={t("stats.maxPoints")} value={t(stats.maxScore)} color="§6" />
        </Historical.exclude>
      </Table.tr>
    </Table.ts>
    <Table.tr>
      <Table.ts title="§6Simon Says">
        <Table.tr>
          <Table.td title={t("stats.wins")} value={t(stats.simonSays.wins)} color="§a" size="small" />
          <Table.td title={t("stats.roundWins")} value={t(stats.simonSays.roundsWon)} color="§b"size="small" />
        </Table.tr>
        <Table.tr>
          <Table.td title={t("stats.points")} value={t(stats.simonSays.points)} color="§e"size="small" />
          <Historical.exclude time={time}>
            <Table.td title={t("stats.maxPoints")} value={t(stats.simonSays.maxScore)} color="§6"size="small" />
          </Historical.exclude>
        </Table.tr>
      </Table.ts>
      <Table.ts title="§6Santa Says">
        <Table.tr>
          <Table.td title={t("stats.wins")} value={t(stats.santaSays.wins)} color="§a" size="small" />
          <Table.td title={t("stats.roundWins")} value={t(stats.santaSays.roundsWon)} color="§b" size="small" />
        </Table.tr>
        <Table.tr>
          <Table.td title={t("stats.points")} value={t(stats.santaSays.points)} color="§e" size="small" />
          <Historical.exclude time={time}>
            <Table.td title={t("stats.maxPoints")} value={t(stats.santaSays.maxScore)} color="§6" size="small" />
          </Historical.exclude>
        </Table.tr>
      </Table.ts>
    </Table.tr>
  </Table.table>
);
