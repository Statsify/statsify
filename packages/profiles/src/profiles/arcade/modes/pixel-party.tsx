/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ARCADE, cardColours } from "@statsify/catalog";
import { LocalizeFunction } from "../../../types.js";
import { PixelParty } from "@statsify/schemas";
import { Table } from "../../../components/index.js";

const colour = cardColours(ARCADE, "pixelParty");

interface PixelPartyTableProps {
  stats: PixelParty;
  t: LocalizeFunction;
}

export const PixelPartyTable = ({ stats, t }: PixelPartyTableProps) => (
  <Table.table>
    <Table.ts title="§6Overall">
      <Table.tr>
        <Table.td title={t("stats.wins")} value={t(stats.overall.wins)} color={colour("overall.wins")} />
        <Table.td title={t("stats.losses")} value={t(stats.overall.losses)} color={colour("overall.losses")} />
        <Table.td title={t("stats.wlr")} value={t(stats.overall.wlr)} color={colour("overall.wlr")} />
      </Table.tr>
      <Table.tr>
        <Table.td
          title={t("stats.gamesPlayed")}
          value={t(stats.overall.gamesPlayed)}
          color={colour("overall.gamesPlayed")}
        />
        <Table.td
          title={t("stats.roundsCompleted")}
          value={t(stats.roundsCompleted)}
          color={colour("roundsCompleted")}
        />
        <Table.td
          title={t("stats.powerupsCollected")}
          value={t(stats.powerupsCollected)}
          color={colour("powerupsCollected")}
        />
      </Table.tr>
    </Table.ts>
    <Table.tr>
      <Table.ts title="§eNormal">
        <Table.tr>
          <Table.td
            title={t("stats.wins")}
            value={t(stats.normal.wins)}
            color={colour("normal.wins")}
            size="small"
          />
          <Table.td
            title={t("stats.losses")}
            value={t(stats.normal.losses)}
            color={colour("normal.losses")}
            size="small"
          />
        </Table.tr>
      </Table.ts>
      <Table.ts title="§dHyper">
        <Table.tr>
          <Table.td
            title={t("stats.wins")}
            value={t(stats.hyper.wins)}
            color={colour("hyper.wins")}
            size="small"
          />
          <Table.td
            title={t("stats.losses")}
            value={t(stats.hyper.losses)}
            color={colour("hyper.losses")}
            size="small"
          />
        </Table.tr>
      </Table.ts>
    </Table.tr>
  </Table.table>
);
