/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { LocalizeFunction } from "@statsify/discord";
import { Table } from "#components";
import { Warlords, WarlordsClass } from "@statsify/schemas";

interface WarlordsClassColumnProps {
  title: string;
  stats: WarlordsClass;
  t: LocalizeFunction;
}

const WarlordsClassColumn = ({ title, stats, t }: WarlordsClassColumnProps) => (
  <Table.ts title={title}>
    <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§e" />
    <Table.td title={t("stats.damage")} value={t(stats.damage)} color="§c" />
    <Table.td title={t("stats.healing")} value={t(stats.healing)} color="§a" />
    <Table.td title={t("stats.prevent")} value={t(stats.prevent)} color="§b" />
    <Table.td title={t("stats.total")} value={t(stats.total)} color="§6" />
  </Table.ts>
);

export interface WarlordsClassTableProps {
  warlords: Warlords;
  t: LocalizeFunction;
}

export const WarlordsClassTable = ({ warlords, t }: WarlordsClassTableProps) => (
  <Table.table>
    <Table.tr>
      <WarlordsClassColumn title="§bMage" stats={warlords.mage} t={t} />
      <WarlordsClassColumn title="§7Warrior" stats={warlords.warrior} t={t} />
      <WarlordsClassColumn title="§ePaladin" stats={warlords.paladin} t={t} />
      <WarlordsClassColumn title="§2Shaman" stats={warlords.shaman} t={t} />
    </Table.tr>
  </Table.table>
);
