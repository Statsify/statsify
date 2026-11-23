/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Card, EmptyCard } from "./components/Card.js";
import { type SidebarItem, Table } from "#components";
import { RARITY_COLORS } from "@statsify/skyblock/display";
import { gridRows } from "./components/ItemGrid.js";
import { prettify, romanNumeral } from "@statsify/util";
import type { SkyBlockProfileProps } from "./skyblock.command.js";

// The employees whose id isn't their name in the factory (the wiki's Chocolate Factory page)
const RENAMED_EMPLOYEES = new Set(["rabbit_father", "rabbit_grandma"]);

const COLUMNS = 4;

export const SkyBlockChocolateProfile = ({ profile, t, ...card }: SkyBlockProfileProps) => {
  const chocolate = profile.member.chocolate;

  if (!chocolate) {
    return <EmptyCard {...card} name={profile.displayName} text={t("skyblock.noChocolate")} />;
  }

  const sidebar: SidebarItem[] = [
    [t("skyblock.prestige"), romanNumeral(chocolate.level), "§d"],
    [t("skyblock.chocolate"), t(chocolate.chocolate), "§6"],
    [t("skyblock.allTimeChocolate"), t(chocolate.total), "§6"],
    [
      t("skyblock.sincePrestige"),
      chocolate.nextPrestige === undefined ?
        t(chocolate.sincePrestige) :
        `${t(chocolate.sincePrestige)}§7/§6${t(chocolate.nextPrestige)}`,
      "§6",
    ],
    [t("skyblock.timeTower"), t(chocolate.timeTower), "§d"],
  ];

  const rabbits = chocolate.rabbits.map(({ rarity, found, total }) => (
    <Table.td title={prettify(rarity)} value={`${t(found)}§7/${t(total)}`} color={RARITY_COLORS[rarity]} size="small" />
  ));

  const employees = chocolate.employees.map(({ employee, level }) => (
    <Table.td
      title={RENAMED_EMPLOYEES.has(employee) ? t(`skyblock.employeeNames.${employee}`) : prettify(employee)}
      value={t(level)}
      color="§a"
      size="small"
    />
  ));

  return (
    <Card {...card} name={profile.displayName} sidebar={sidebar}>
      <Table.table>
        <Table.ts title={`§a${t("skyblock.rabbits")}`}>{gridRows(rabbits, COLUMNS)}</Table.ts>
        <Table.ts title={`§a${t("skyblock.employees")}`}>{gridRows(employees, COLUMNS)}</Table.ts>
      </Table.table>
    </Card>
  );
};
