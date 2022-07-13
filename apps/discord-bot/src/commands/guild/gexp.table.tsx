/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { If, Table } from "#components";
import { LocalizeFunction } from "@statsify/discord";

export interface GexpTableProps {
  dates: string[];
  expHistory: number[];
  scaledExpHistory?: number[];
  t: LocalizeFunction;
}

const formatHypixelGuildDate = (date: string) => {
  const [year, month, day] = date.split("-");
  return `${month}/${day}/${year.replace("20", "")}`;
};

export const GexpTable = ({ dates, expHistory, scaledExpHistory, t }: GexpTableProps) => {
  const expBorder = scaledExpHistory
    ? { topLeft: 0, bottomLeft: 0, bottomRight: 0, topRight: 0 }
    : { topLeft: 0, bottomLeft: 0, bottomRight: 4, topRight: 4 };

  return (
    <Table.table>
      <Table.tr>
        <box
          width="100%"
          border={{ topLeft: 4, bottomLeft: 4, bottomRight: 0, topRight: 0 }}
        >
          <text>§7§l{t("stats.guild.date")}</text>
        </box>
        <box width="100%" border={expBorder}>
          <text>§2§l{t("stats.guild.gexp")}</text>
        </box>
        <If condition={scaledExpHistory}>
          <box
            width="100%"
            border={{ topLeft: 0, bottomLeft: 0, bottomRight: 4, topRight: 4 }}
          >
            <text>§2§l{t("stats.guild.scaledGexp")}</text>
          </box>
        </If>
      </Table.tr>
      <>
        {expHistory.slice(0, 7).map((exp, i) => (
          <Table.tr>
            <box
              width="100%"
              border={{ topLeft: 4, bottomLeft: 4, bottomRight: 0, topRight: 0 }}
            >
              <text>§f{formatHypixelGuildDate(dates[i])}</text>
            </box>
            <box width="100%" border={expBorder}>
              <text>§2{t(exp)}</text>
            </box>
            <If condition={scaledExpHistory}>
              {(scaledExpHistory) => (
                <box
                  width="100%"
                  border={{ topLeft: 0, bottomLeft: 0, bottomRight: 4, topRight: 4 }}
                >
                  <text>§2{t(scaledExpHistory[i])}</text>
                </box>
              )}
            </If>
          </Table.tr>
        ))}
      </>
    </Table.table>
  );
};
