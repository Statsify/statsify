/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { HideAndSeek } from "@statsify/schemas";
import { LocalizeFunction } from "@statsify/discord";
import { Table } from "#components";

interface HideAndSeekTableProps {
  stats: HideAndSeek;
  t: LocalizeFunction;
}

export const HideAndSeekTable = ({ stats, t }: HideAndSeekTableProps) => {
  const { partyPooper, propHunt, overall } = stats;

  return (
    <Table.table>
      <Table.ts title="§6Overall">
        <Table.tr>
          <Table.td title={t("stats.wins")} value={t(overall.wins)} color="§a" />
          <Table.td
            title={t("stats.hiderWins")}
            value={t(overall.hiderWins)}
            color="§e"
          />
          <Table.td
            title={t("stats.seekerWins")}
            value={t(overall.seekerWins)}
            color="§b"
          />
        </Table.tr>
      </Table.ts>
      <Table.ts title="§6Party Pooper">
        <Table.tr>
          <Table.td title={t("stats.wins")} value={t(partyPooper.wins)} color="§a" />
          <Table.td
            title={t("stats.hiderWins")}
            value={t(partyPooper.hiderWins)}
            color="§e"
          />
          <Table.td
            title={t("stats.seekerWins")}
            value={t(partyPooper.seekerWins)}
            color="§b"
          />
        </Table.tr>
      </Table.ts>
      <Table.ts title="§6Prop Hunt">
        <Table.tr>
          <Table.td title={t("stats.wins")} value={t(propHunt.wins)} color="§a" />
          <Table.td
            title={t("stats.hiderWins")}
            value={t(propHunt.hiderWins)}
            color="§e"
          />
          <Table.td
            title={t("stats.seekerWins")}
            value={t(propHunt.seekerWins)}
            color="§b"
          />
        </Table.tr>
      </Table.ts>
    </Table.table>
  );
};
