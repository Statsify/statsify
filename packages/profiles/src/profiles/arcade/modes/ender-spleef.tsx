/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ARCADE, cardColours } from "@statsify/catalog";
import { EnderSpleef } from "@statsify/schemas";
import { LocalizeFunction } from "../../../types.js";
import { Table } from "../../../components/index.js";
import { prettify } from "@statsify/util";

const colour = cardColours(ARCADE, "enderSpleef");

interface EnderSpleefTableProps {
  stats: EnderSpleef;
  t: LocalizeFunction;
}

export const EnderSpleefTable = ({ stats, t }: EnderSpleefTableProps) => (
  <Table.table>
    <Table.tr>
      <Table.td title={t("stats.wins")} value={t(stats.wins)} color={colour("wins")} />
      <Table.td
        title={t("stats.blocksBroken")}
        value={t(stats.blocksBroken)}
        color={colour("blocksBroken")}
      />
      <Table.td title={t("stats.trail")} value={prettify(stats.trail)} color={colour("trail")} />
    </Table.tr>
    <Table.ts title={`§b${t("stats.powerupActivations")}`}>
      <Table.tr>
        <Table.td title={t("stats.bigShot")} value={t(stats.bigShot)} color={colour("bigShot")} />
        <Table.td title={t("stats.tripleShot")} value={t(stats.tripleShot)} color={colour("tripleShot")} />
        <Table.td
          title={t("stats.total")}
          value={t(stats.powerupActivations)}
          color={colour("powerupActivations")}
        />
      </Table.tr>
    </Table.ts>
  </Table.table>
);
