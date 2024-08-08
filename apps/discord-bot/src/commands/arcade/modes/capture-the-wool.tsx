/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Historical, If, type SidebarItem, Table } from "#components";
import { formatTime } from "@statsify/util";
import type { Arcade, CaptureTheWool } from "@statsify/schemas";
import type { LocalizeFunction } from "@statsify/discord";
import type { ProfileTime } from "#commands/base.hypixel-command";

interface CaptureTheWoolTableProps {
  stats: CaptureTheWool;
  t: LocalizeFunction;
  time: ProfileTime;
}

export const CaptureTheWoolTable = ({ stats, t, time }: CaptureTheWoolTableProps) => (
  <Table.table>
    <Table.ts title="§6Overall">
      <Table.tr>
        <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§a" />
        <Table.td title={t("stats.losses")} value={t(stats.losses)} color="§c" />
        <Table.td title={t("stats.wlr")} value={t(stats.wlr)} color="§6" />
        <Table.td title={t("stats.draws")} value={t(stats.draws)} color="§e" />
      </Table.tr>
      <Table.tr>
        <Table.td title={t("stats.kills")} value={t(stats.kills)} color="§a" />
        <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color="§c" />
        <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color="§6" />
        <Table.td
          title={t("stats.assists")}
          value={t(stats.assists)}
          color="§e"
        />
      </Table.tr>
      <Table.tr>
        <Table.td
          title={t("stats.woolPickedUp")}
          value={t(stats.woolPickedUp)}
          color="§2"
        />
        <Table.td
          title={t("stats.woolCaptured")}
          value={t(stats.woolCaptured)}
          color="§b"
        />
      </Table.tr>
      <Historical.exclude time={time}>
        <Table.tr>
          <If condition={stats.fastestWin > 0}>
            <Table.td
              title={t("stats.fastestWin")}
              value={formatTime(stats.fastestWin)}
              color="§e"
            />
          </If>
          <If condition={stats.fastestWoolCapture > 0}>
            <Table.td
              title={t("stats.fastestWoolCapture")}
              value={formatTime(stats.fastestWoolCapture)}
              color="§6"
            />
          </If>
          <If condition={stats.longestGame > 0}>
            <Table.td
              title={t("stats.longestGame")}
              value={formatTime(stats.longestGame)}
              color="§d"
            />
          </If>
        </Table.tr>
      </Historical.exclude>
    </Table.ts>
    <Table.tr>
      <Table.ts title="§6Against Wool Holder">
        <Table.tr>
          <Table.td title={t("stats.kills")} value={t(stats.killsOnWoolHolder)} color="§a" />
          <Table.td title={t("stats.deaths")} value={t(stats.deathsToWoolHolder)} color="§c" />
        </Table.tr>
      </Table.ts>
      <Table.ts title="§6As Wool Holder">
        <Table.tr>
          <Table.td title={t("stats.kills")} value={t(stats.killsAsWoolHolder)} color="§a" />
          <Table.td title={t("stats.deaths")} value={t(stats.deathsAsWoolHolder)} color="§c" />
        </Table.tr>
      </Table.ts>
    </Table.tr>
  </Table.table>
);

export function captureTheWoolSiderbar(arcade: Arcade, t: LocalizeFunction): SidebarItem[] {
  const captureTheWool = arcade.captureTheWool;

  return [
    [t("stats.coins"), t(arcade.coins), "§6"],
    [t("stats.goldEarned"), t(captureTheWool.goldEarned), "§6"],
    [t("stats.goldSpent"), t(captureTheWool.goldSpent), "§6"],
  ];
}
