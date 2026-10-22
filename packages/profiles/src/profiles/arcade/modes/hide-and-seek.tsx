/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ARCADE, cardColours } from "@statsify/catalog";
import { HideAndSeek } from "@statsify/schemas";
import { LocalizeFunction } from "../../../types.js";
import { Table } from "../../../components/index.js";

const colour = cardColours(ARCADE, "hideAndSeek");

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
          <Table.td title={t("stats.wins")} value={t(overall.wins)} color={colour("overall.wins")} />
          <Table.td
            title={t("stats.hiderWins")}
            value={t(overall.hiderWins)}
            color={colour("overall.hiderWins")}
          />
          <Table.td
            title={t("stats.seekerWins")}
            value={t(overall.seekerWins)}
            color={colour("overall.seekerWins")}
          />
        </Table.tr>
      </Table.ts>
      <Table.ts title="§6Party Pooper">
        <Table.tr>
          <Table.td
            title={t("stats.wins")}
            value={t(partyPooper.wins)}
            color={colour("partyPooper.wins")}
          />
          <Table.td
            title={t("stats.hiderWins")}
            value={t(partyPooper.hiderWins)}
            color={colour("partyPooper.hiderWins")}
          />
          <Table.td
            title={t("stats.seekerWins")}
            value={t(partyPooper.seekerWins)}
            color={colour("partyPooper.seekerWins")}
          />
        </Table.tr>
        <Table.tr>
          <Table.td
            title={t("stats.objectives")}
            value={t(objectivesCompleted)}
            color={colour("objectivesCompleted")}
          />
          <Table.td
            title={t("stats.kills")}
            value={t(kills)}
            color={colour("kills")}
          />
        </Table.tr>
      </Table.ts>
      <Table.ts title="§6Prop Hunt">
        <Table.tr>
          <Table.td
            title={t("stats.wins")}
            value={t(propHunt.wins)}
            color={colour("propHunt.wins")}
          />
          <Table.td
            title={t("stats.hiderWins")}
            value={t(propHunt.hiderWins)}
            color={colour("propHunt.hiderWins")}
          />
          <Table.td
            title={t("stats.seekerWins")}
            value={t(propHunt.seekerWins)}
            color={colour("propHunt.seekerWins")}
          />
        </Table.tr>
      </Table.ts>
    </Table.table>
  );
};
