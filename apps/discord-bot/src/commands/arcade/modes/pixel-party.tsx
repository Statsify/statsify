/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { LocalizeFunction } from "@statsify/discord";
import { PixelParty } from "@statsify/schemas";
import { Table } from "#components";

interface PixelPartyTableProps {
  stats: PixelParty;
  t: LocalizeFunction;
}

export const PixelPartyTable = ({ stats, t }: PixelPartyTableProps) => (
  <Table.table>
    <Table.ts title="§6Overall">
      <Table.tr>
        <Table.td title={t("stats.wins")} value={t(stats.overall.wins)} color="§a" />
        <Table.td title={t("stats.losses")} value={t(stats.overall.losses)} color="§c" />
        <Table.td title={t("stats.wlr")} value={t(stats.overall.wlr)} color="§6" />
      </Table.tr>
      <Table.tr>
        <Table.td
          title={t("stats.gamesPlayed")}
          value={t(stats.overall.gamesPlayed)}
          color="§b"
        />
        <Table.td
          title={t("stats.roundsCompleted")}
          value={t(stats.roundsCompleted)}
          color="§e"
        />
        <Table.td
          title={t("stats.powerupsCollected")}
          value={t(stats.powerupsCollected)}
          color="§d"
        />
      </Table.tr>
    </Table.ts>
    <Table.tr>
      <Table.ts title="§eNormal">
        <Table.tr>
          <Table.td
            title={t("stats.wins")}
            value={t(stats.normal.wins)}
            color="§a"
            size="small"
          />
          <Table.td
            title={t("stats.losses")}
            value={t(stats.normal.losses)}
            color="§c"
            size="small"
          />
        </Table.tr>
      </Table.ts>
      <Table.ts title="§dHyper">
        <Table.tr>
          <Table.td
            title={t("stats.wins")}
            value={t(stats.hyper.wins)}
            color="§a"
            size="small"
          />
          <Table.td
            title={t("stats.losses")}
            value={t(stats.hyper.losses)}
            color="§c"
            size="small"
          />
        </Table.tr>
      </Table.ts>
    </Table.tr>
  </Table.table>
);
