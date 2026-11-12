/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ClassMetadata, METADATA_KEY, WarlordsClass, WarlordsSpecification } from "@statsify/schemas";
import { WARLORDS, cardColours } from "@statsify/catalog";
import type { LocalizeFunction } from "../../../types.js";
import { Table } from "../../../components/index.js";
import type { Constructor } from "@statsify/util";

interface WarlordsClassColumnProps {
  title: string;
  stats: WarlordsSpecification;
  /** Where the column's stats are: a class (`mage`) or one of its specs (`mage.attack`). */
  place: string;
  t: LocalizeFunction;
}

const WarlordsSpecificationColumn = ({ title, stats, place, t }: WarlordsClassColumnProps) => {
  const color = cardColors(WARLORDS, place);

  return (
    <Table.ts title={title}>
      <Table.td title={t("stats.wins")} value={t(stats.wins)} color={color("wins")} />
      <Table.td title={t("stats.damage")} value={t(stats.damage)} color={color("damage")} />
      <Table.td title={t("stats.healing")} value={t(stats.healing)} color={color("healing")} />
      <Table.td title={t("stats.prevent")} value={t(stats.prevent)} color={color("prevent")} />
      <Table.td title={t("stats.total")} value={t(stats.total)} color={color("total")} />
    </Table.ts>
  );
};

export interface WarlordsClassTableProps {
  stats: WarlordsClass;
  /** The class's mode: `mage`, `warrior`, `paladin` or `shaman`. */
  place: string;
  constructor: Constructor<WarlordsClass>;
  color: string;
  t: LocalizeFunction;
}

export const WarlordsClassTable = ({ stats, place, t, constructor, color }: WarlordsClassTableProps) => {
  const { attack, defense, healer } = getSpecificationNames(constructor);

  return (
    <Table.table>
      <Table.tr>
        <WarlordsSpecificationColumn title={`${color}Overall`} stats={stats} place={place} t={t} />
        <WarlordsSpecificationColumn title={`§4${attack}`} stats={stats.attack} place={`${place}.attack`} t={t} />
        <WarlordsSpecificationColumn title={`§7${defense}`} stats={stats.defense} place={`${place}.defense`} t={t} />
        <WarlordsSpecificationColumn title={`§3${healer}`} stats={stats.healer} place={`${place}.healer`} t={t} />
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
