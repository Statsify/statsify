/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ARCADE, cardColors } from "@statsify/catalog";
import { HideAndSeek } from "@statsify/schemas";
import type { LocalizeFunction } from "../../../types.js";
import { Table } from "../../../components/index.js";

const color = cardColors(ARCADE, "hideAndSeek");

interface HideAndSeekTableProps {
  stats: HideAndSeek;
  t: LocalizeFunction;
}

export const HideAndSeekTable = ({ stats, t }: HideAndSeekTableProps) => {
  const { partyPooper, propHunt, overall, kills, objectivesCompleted } = stats;

  return (
    <Table.table>
      <Table.ts title="§6Overall">
        <Table.tr>
          <Table.td title={t("stats.wins")} value={t(overall.wins)} color={color("overall.wins")} />
          <Table.td
            title={t("stats.hiderWins")}
            value={t(overall.hiderWins)}
            color={color("overall.hiderWins")}
          />
          <Table.td
            title={t("stats.seekerWins")}
            value={t(overall.seekerWins)}
            color={color("overall.seekerWins")}
          />
        </Table.tr>
      </Table.ts>
      <Table.ts title="§6Party Pooper">
        <Table.tr>
          <Table.td
            title={t("stats.wins")}
            value={t(partyPooper.wins)}
            color={color("partyPooper.wins")}
          />
          <Table.td
            title={t("stats.hiderWins")}
            value={t(partyPooper.hiderWins)}
            color={color("partyPooper.hiderWins")}
          />
          <Table.td
            title={t("stats.seekerWins")}
            value={t(partyPooper.seekerWins)}
            color={color("partyPooper.seekerWins")}
          />
        </Table.tr>
        <Table.tr>
          <Table.td
            title={t("stats.objectives")}
            value={t(objectivesCompleted)}
            color={color("objectivesCompleted")}
          />
          <Table.td
            title={t("stats.kills")}
            value={t(kills)}
            color={color("kills")}
          />
        </Table.tr>
      </Table.ts>
      <Table.ts title="§6Prop Hunt">
        <Table.tr>
          <Table.td
            title={t("stats.wins")}
            value={t(propHunt.wins)}
            color={color("propHunt.wins")}
          />
          <Table.td
            title={t("stats.hiderWins")}
            value={t(propHunt.hiderWins)}
            color={color("propHunt.hiderWins")}
          />
          <Table.td
            title={t("stats.seekerWins")}
            value={t(propHunt.seekerWins)}
            color={color("propHunt.seekerWins")}
          />
        </Table.tr>
      </Table.ts>
    </Table.table>
  );
};
