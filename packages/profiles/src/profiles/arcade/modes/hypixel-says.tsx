/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ARCADE, cardColours } from "@statsify/catalog";
import { HypixelSays } from "@statsify/schemas";
import type { LocalizeFunction } from "../../../types.js";
import { Table } from "../../../components/index.js";

const colour = cardColours(ARCADE, "hypixelSays");

interface HypixelSaysTableProps {
  stats: HypixelSays;
  t: LocalizeFunction;
}

export const HypixelSaysTable = ({ stats, t }: HypixelSaysTableProps) => (
  <Table.table>
    <Table.ts title="§6Hypixel Says">
      <Table.tr>
        <Table.td title={t("stats.wins")} value={t(stats.wins)} color={colour("wins")} />
        <Table.td title={t("stats.roundWins")} value={t(stats.roundsWon)} color={colour("roundsWon")} />
      </Table.tr>
      <Table.tr>
        <Table.td title={t("stats.points")} value={t(stats.points)} color={colour("points")} />
        <Table.td title={t("stats.maxPoints")} value={t(stats.maxScore)} color={colour("maxScore")} />
      </Table.tr>
    </Table.ts>
    <Table.tr>
      <Table.ts title="§6Simon Says">
        <Table.tr>
          <Table.td title={t("stats.wins")} value={t(stats.simonSays.wins)} color={colour("simonSays.wins")} size="small" />
          <Table.td title={t("stats.roundWins")} value={t(stats.simonSays.roundsWon)} color={colour("simonSays.roundsWon")}size="small" />
        </Table.tr>
        <Table.tr>
          <Table.td title={t("stats.points")} value={t(stats.simonSays.points)} color={colour("simonSays.points")}size="small" />
          <Table.td title={t("stats.maxPoints")} value={t(stats.simonSays.maxScore)} color={colour("simonSays.maxScore")}size="small" />
        </Table.tr>
      </Table.ts>
      <Table.ts title="§6Santa Says">
        <Table.tr>
          <Table.td title={t("stats.wins")} value={t(stats.santaSays.wins)} color={colour("santaSays.wins")} size="small" />
          <Table.td title={t("stats.roundWins")} value={t(stats.santaSays.roundsWon)} color={colour("santaSays.roundsWon")} size="small" />
        </Table.tr>
        <Table.tr>
          <Table.td title={t("stats.points")} value={t(stats.santaSays.points)} color={colour("santaSays.points")} size="small" />
          <Table.td title={t("stats.maxPoints")} value={t(stats.santaSays.maxScore)} color={colour("santaSays.maxScore")} size="small" />
        </Table.tr>
      </Table.ts>
    </Table.tr>
  </Table.table>
);
