/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Historical, If, Table } from "#components";
import { formatTime } from "@statsify/util";
import type { CaptureTheWool } from "@statsify/schemas";
import type { LocalizeFunction } from "@statsify/discord";
import type { ProfileTime } from "#commands/base.hypixel-command";

interface CaptureTheWoolTableProps {
  captureTheWool: CaptureTheWool;
  t: LocalizeFunction;
  time: ProfileTime;
}

export const CaptureTheWoolTable = ({ captureTheWool, t, time }: CaptureTheWoolTableProps) => (
  <Table.table>
    <Table.ts title="§6Overall">
      <Table.tr>
        <Table.td title={t("stats.wins")} value={t(captureTheWool.wins)} color="§a" />
        <Table.td title={t("stats.losses")} value={t(captureTheWool.losses)} color="§c" />
        <Table.td title={t("stats.wlr")} value={t(captureTheWool.wlr)} color="§6" />
        <Table.td title={t("stats.draws")} value={t(captureTheWool.draws)} color="§e" />
      </Table.tr>
      <Table.tr>
        <Table.td title={t("stats.kills")} value={t(captureTheWool.kills)} color="§a" />
        <Table.td title={t("stats.deaths")} value={t(captureTheWool.deaths)} color="§c" />
        <Table.td title={t("stats.kdr")} value={t(captureTheWool.kdr)} color="§6" />
        <Table.td
          title={t("stats.assists")}
          value={t(captureTheWool.assists)}
          color="§e"
        />
      </Table.tr>
      <Table.tr>
        <Table.td
          title={t("stats.woolPickedUp")}
          value={t(captureTheWool.woolPickedUp)}
          color="§2"
        />
        <Table.td
          title={t("stats.woolCaptured")}
          value={t(captureTheWool.woolCaptured)}
          color="§b"
        />
      </Table.tr>
      <Historical.exclude time={time}>
        <Table.tr>
          <If condition={captureTheWool.fastestWin > 0}>
            <Table.td
              title={t("stats.fastestWin")}
              value={formatTime(captureTheWool.fastestWin)}
              color="§e"
            />
          </If>
          <If condition={captureTheWool.fastestWoolCapture > 0}>
            <Table.td
              title={t("stats.fastestWoolCapture")}
              value={formatTime(captureTheWool.fastestWoolCapture)}
              color="§6"
            />
          </If>
          <If condition={captureTheWool.longestGame > 0}>
            <Table.td
              title={t("stats.longestGame")}
              value={formatTime(captureTheWool.longestGame)}
              color="§d"
            />
          </If>
        </Table.tr>
      </Historical.exclude>
    </Table.ts>
    <Table.tr>
      <Table.ts title="§6Against Wool Holder">
        <Table.tr>
          <Table.td title={t("stats.kills")} value={t(captureTheWool.killsOnWoolHolder)} color="§a" />
          <Table.td title={t("stats.deaths")} value={t(captureTheWool.deathsToWoolHolder)} color="§c" />
        </Table.tr>
      </Table.ts>
      <Table.ts title="§6As Wool Holder">
        <Table.tr>
          <Table.td title={t("stats.kills")} value={t(captureTheWool.killsAsWoolHolder)} color="§a" />
          <Table.td title={t("stats.deaths")} value={t(captureTheWool.deathsAsWoolHolder)} color="§c" />
        </Table.tr>
      </Table.ts>
    </Table.tr>
  </Table.table>
);
