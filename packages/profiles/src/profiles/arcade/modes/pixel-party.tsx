/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ARCADE, cardColors } from "@statsify/catalog";
import type { LocalizeFunction } from "../../../types.js";
import { PixelParty } from "@statsify/schemas";
import { Table } from "../../../components/index.js";

const color = cardColors(ARCADE, "pixelParty");

interface PixelPartyTableProps {
  stats: PixelParty;
  t: LocalizeFunction;
}

export const PixelPartyTable = ({ stats, t }: PixelPartyTableProps) => (
  <Table.table>
    <Table.ts title="§6Overall">
      <Table.tr>
        <Table.td title={t("stats.wins")} value={t(stats.overall.wins)} color={color("overall.wins")} />
        <Table.td title={t("stats.losses")} value={t(stats.overall.losses)} color={color("overall.losses")} />
        <Table.td title={t("stats.wlr")} value={t(stats.overall.wlr)} color={color("overall.wlr")} />
      </Table.tr>
      <Table.tr>
        <Table.td
          title={t("stats.gamesPlayed")}
          value={t(stats.overall.gamesPlayed)}
          color={color("overall.gamesPlayed")}
        />
        <Table.td
          title={t("stats.roundsCompleted")}
          value={t(stats.roundsCompleted)}
          color={color("roundsCompleted")}
        />
        <Table.td
          title={t("stats.powerupsCollected")}
          value={t(stats.powerupsCollected)}
          color={color("powerupsCollected")}
        />
      </Table.tr>
    </Table.ts>
    <Table.tr>
      <Table.ts title="§eNormal">
        <Table.tr>
          <Table.td
            title={t("stats.wins")}
            value={t(stats.normal.wins)}
            color={color("normal.wins")}
            size="small"
          />
          <Table.td
            title={t("stats.losses")}
            value={t(stats.normal.losses)}
            color={color("normal.losses")}
            size="small"
          />
        </Table.tr>
      </Table.ts>
      <Table.ts title="§dHyper">
        <Table.tr>
          <Table.td
            title={t("stats.wins")}
            value={t(stats.hyper.wins)}
            color={color("hyper.wins")}
            size="small"
          />
          <Table.td
            title={t("stats.losses")}
            value={t(stats.hyper.losses)}
            color={color("hyper.losses")}
            size="small"
          />
        </Table.tr>
      </Table.ts>
    </Table.tr>
  </Table.table>
);
