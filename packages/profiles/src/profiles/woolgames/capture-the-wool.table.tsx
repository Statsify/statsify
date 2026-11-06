/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Historical, If, Table } from "../../components/index.js";
import { WOOL_GAMES, cardColours } from "@statsify/catalog";
import { formatTime } from "@statsify/util";
import type { CaptureTheWool } from "@statsify/schemas";
import type { LocalizeFunction, ProfileTime } from "../../types.js";

const colour = cardColours(WOOL_GAMES, "captureTheWool");

interface CaptureTheWoolTableProps {
  captureTheWool: CaptureTheWool;
  t: LocalizeFunction;
  time: ProfileTime;
}

export const CaptureTheWoolTable = ({ captureTheWool, t, time }: CaptureTheWoolTableProps) => (
  <Table.table>
    <Table.ts title="§6Overall">
      <Table.tr>
        <Table.td title={t("stats.wins")} value={t(captureTheWool.wins)} color={colour("wins")} />
        <Table.td title={t("stats.losses")} value={t(captureTheWool.losses)} color={colour("losses")} />
        <Table.td title={t("stats.wlr")} value={t(captureTheWool.wlr)} color={colour("wlr")} />
        <Table.td title={t("stats.draws")} value={t(captureTheWool.draws)} color={colour("draws")} />
      </Table.tr>
      <Table.tr>
        <Table.td title={t("stats.kills")} value={t(captureTheWool.kills)} color={colour("kills")} />
        <Table.td title={t("stats.deaths")} value={t(captureTheWool.deaths)} color={colour("deaths")} />
        <Table.td title={t("stats.kdr")} value={t(captureTheWool.kdr)} color={colour("kdr")} />
        <Table.td
          title={t("stats.assists")}
          value={t(captureTheWool.assists)}
          color={colour("assists")}
        />
      </Table.tr>
      <Table.tr>
        <Table.td
          title={t("stats.woolPickedUp")}
          value={t(captureTheWool.woolPickedUp)}
          color={colour("woolPickedUp")}
        />
        <Table.td
          title={t("stats.woolCaptured")}
          value={t(captureTheWool.woolCaptured)}
          color={colour("woolCaptured")}
        />
      </Table.tr>
      <Historical.exclude time={time}>
        <Table.tr>
          <If condition={captureTheWool.fastestWin > 0}>
            <Table.td
              title={t("stats.fastestWin")}
              value={formatTime(captureTheWool.fastestWin)}
              color={colour("fastestWin")}
            />
          </If>
          <If condition={captureTheWool.fastestWoolCapture > 0}>
            <Table.td
              title={t("stats.fastestWoolCapture")}
              value={formatTime(captureTheWool.fastestWoolCapture)}
              color={colour("fastestWoolCapture")}
            />
          </If>
          <If condition={captureTheWool.longestGame > 0}>
            <Table.td
              title={t("stats.longestGame")}
              value={formatTime(captureTheWool.longestGame)}
              color={colour("longestGame")}
            />
          </If>
        </Table.tr>
      </Historical.exclude>
    </Table.ts>
    <Table.tr>
      <Table.ts title="§6Against Wool Holder">
        <Table.tr>
          <Table.td title={t("stats.kills")} value={t(captureTheWool.killsOnWoolHolder)} color={colour("killsOnWoolHolder")} />
          <Table.td title={t("stats.deaths")} value={t(captureTheWool.deathsToWoolHolder)} color={colour("deathsToWoolHolder")} />
        </Table.tr>
      </Table.ts>
      <Table.ts title="§6As Wool Holder">
        <Table.tr>
          <Table.td title={t("stats.kills")} value={t(captureTheWool.killsAsWoolHolder)} color={colour("killsAsWoolHolder")} />
          <Table.td title={t("stats.deaths")} value={t(captureTheWool.deathsAsWoolHolder)} color={colour("deathsAsWoolHolder")} />
        </Table.tr>
      </Table.ts>
    </Table.tr>
  </Table.table>
);
