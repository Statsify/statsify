/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Historical, If, Table } from "../../components/index.js";
import { WOOL_GAMES, cardColors } from "@statsify/catalog";
import { formatTime } from "@statsify/util";
import type { CaptureTheWool } from "@statsify/schemas";
import type { LocalizeFunction, ProfileTime } from "../../types.js";

const color = cardColors(WOOL_GAMES, "captureTheWool");

interface CaptureTheWoolTableProps {
  captureTheWool: CaptureTheWool;
  t: LocalizeFunction;
  time: ProfileTime;
}

export const CaptureTheWoolTable = ({ captureTheWool, t, time }: CaptureTheWoolTableProps) => (
  <Table.table>
    <Table.ts title="§6Overall">
      <Table.tr>
        <Table.td title={t("stats.wins")} value={t(captureTheWool.wins)} color={color("wins")} />
        <Table.td title={t("stats.losses")} value={t(captureTheWool.losses)} color={color("losses")} />
        <Table.td title={t("stats.wlr")} value={t(captureTheWool.wlr)} color={color("wlr")} />
        <Table.td title={t("stats.draws")} value={t(captureTheWool.draws)} color={color("draws")} />
      </Table.tr>
      <Table.tr>
        <Table.td title={t("stats.kills")} value={t(captureTheWool.kills)} color={color("kills")} />
        <Table.td title={t("stats.deaths")} value={t(captureTheWool.deaths)} color={color("deaths")} />
        <Table.td title={t("stats.kdr")} value={t(captureTheWool.kdr)} color={color("kdr")} />
        <Table.td
          title={t("stats.assists")}
          value={t(captureTheWool.assists)}
          color={color("assists")}
        />
      </Table.tr>
      <Table.tr>
        <Table.td
          title={t("stats.woolPickedUp")}
          value={t(captureTheWool.woolPickedUp)}
          color={color("woolPickedUp")}
        />
        <Table.td
          title={t("stats.woolCaptured")}
          value={t(captureTheWool.woolCaptured)}
          color={color("woolCaptured")}
        />
      </Table.tr>
      <Historical.exclude time={time}>
        <Table.tr>
          <If condition={captureTheWool.fastestWin > 0}>
            <Table.td
              title={t("stats.fastestWin")}
              value={formatTime(captureTheWool.fastestWin)}
              color={color("fastestWin")}
            />
          </If>
          <If condition={captureTheWool.fastestWoolCapture > 0}>
            <Table.td
              title={t("stats.fastestWoolCapture")}
              value={formatTime(captureTheWool.fastestWoolCapture)}
              color={color("fastestWoolCapture")}
            />
          </If>
          <If condition={captureTheWool.longestGame > 0}>
            <Table.td
              title={t("stats.longestGame")}
              value={formatTime(captureTheWool.longestGame)}
              color={color("longestGame")}
            />
          </If>
        </Table.tr>
      </Historical.exclude>
    </Table.ts>
    <Table.tr>
      <Table.ts title="§6Against Wool Holder">
        <Table.tr>
          <Table.td title={t("stats.kills")} value={t(captureTheWool.killsOnWoolHolder)} color={color("killsOnWoolHolder")} />
          <Table.td title={t("stats.deaths")} value={t(captureTheWool.deathsToWoolHolder)} color={color("deathsToWoolHolder")} />
        </Table.tr>
      </Table.ts>
      <Table.ts title="§6As Wool Holder">
        <Table.tr>
          <Table.td title={t("stats.kills")} value={t(captureTheWool.killsAsWoolHolder)} color={color("killsAsWoolHolder")} />
          <Table.td title={t("stats.deaths")} value={t(captureTheWool.deathsAsWoolHolder)} color={color("deathsAsWoolHolder")} />
        </Table.tr>
      </Table.ts>
    </Table.tr>
  </Table.table>
);
