/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ClassMetadata, METADATA_KEY, WarlordsClass, WarlordsSpecification } from "@statsify/schemas";
import { LocalizeFunction } from "@statsify/discord";
import { Table } from "#components";
import type { Constructor } from "@statsify/util";

interface WarlordsClassColumnProps {
  title: string;
  stats: WarlordsSpecification;
  t: LocalizeFunction;
}

const WarlordsSpecificationColumn = ({ title, stats, t }: WarlordsClassColumnProps) => (
  <Table.ts title={title}>
    <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§e" />
    <Table.td title={t("stats.damage")} value={t(stats.damage)} color="§c" />
    <Table.td title={t("stats.healing")} value={t(stats.healing)} color="§a" />
    <Table.td title={t("stats.prevent")} value={t(stats.prevent)} color="§b" />
    <Table.td title={t("stats.total")} value={t(stats.total)} color="§6" />
  </Table.ts>
);

export interface WarlordsClassTableProps {
  stats: WarlordsClass;
  constructor: Constructor<WarlordsClass>;
  color: string;
  t: LocalizeFunction;
}

export const WarlordsClassTable = ({ stats, t, constructor, color }: WarlordsClassTableProps) => {
  const { attack, defense, healer } = getSpecificationNames(constructor);

  return (
    <Table.table>
      <Table.tr>
        <WarlordsSpecificationColumn title={`${color}Overall`} stats={stats} t={t} />
        <WarlordsSpecificationColumn title={`§4${attack}`} stats={stats.attack} t={t} />
        <WarlordsSpecificationColumn title={`§7${defense}`} stats={stats.defense} t={t} />
        <WarlordsSpecificationColumn title={`§3${healer}`} stats={stats.healer} t={t} />
      </Table.tr>
    </Table.table>
  );
};

function getSpecificationNames(constructor: Constructor<WarlordsClass>) {
  const metadata = Reflect.getMetadata(METADATA_KEY, constructor.prototype) as ClassMetadata;

  return {
    attack: metadata.attack.leaderboard.name,
    defense: metadata.defense.leaderboard.name,
    healer: metadata.healer.leaderboard.name,
  };
}
