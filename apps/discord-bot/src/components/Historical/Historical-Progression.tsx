/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { HistoricalTimeData } from "./Historical-Header";
import { If } from "../If";
import { LocalizeFunction } from "@statsify/discord";
import { Progression } from "@statsify/schemas";
import { Table } from "../Table";
import { formatProgression } from "../Header/progression";

export interface HistoricalProgressionProps {
  progression: Progression;
  t: LocalizeFunction;
  level: number;
  exp: number;
  current: string;
  next: string;
  time: "LIVE" | HistoricalTimeData;
}

export const HistoricalProgression = ({
  progression,
  t,
  level,
  exp,
  current,
  next,
  time,
}: HistoricalProgressionProps) => (
  <If condition={time !== "LIVE"}>
    <>
      <Table.tr>
        <Table.td
          title={t("stats.levelsGained")}
          value={t(level)}
          color="§b"
          size="small"
        />
        <Table.td title={t("stats.expGained")} value={t(exp)} color="§b" size="small" />
      </Table.tr>
      <Table.tr>
        <box width="100%">
          <text>
            {formatProgression({
              t,
              progression,
              currentLevel: current,
              nextLevel: next,
              showLevel: true,
              showProgress: false,
            })}
          </text>
        </box>
      </Table.tr>
    </>
  </If>
);
