/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, type SidebarItem, Table } from "#components";
import { Empty } from "./components/Empty.js";
import { RARITY_COLORS, gridRows } from "./components/ItemGrid.js";
import { prettify, romanNumeral } from "@statsify/util";
import type { SkyBlockProfileProps } from "./skyblock.command.js";

const COLUMNS = 4;

export const SkyBlockChocolateProfile = ({
  profile,
  title,
  skin,
  badge,
  background,
  logo,
  user,
  t,
}: SkyBlockProfileProps) => {
  const chocolate = profile.member.chocolate;

  if (!chocolate) {
    return (
      <Container background={background}>
        <Header skin={skin} name={profile.displayName} badge={badge} title={title} time="LIVE" />
        <Empty text={t("skyblock.noChocolate")} />
        <Footer logo={logo} user={user} />
      </Container>
    );
  }

  const sidebar: SidebarItem[] = [
    [t("skyblock.prestige"), romanNumeral(chocolate.level), "§d"],
    [t("skyblock.chocolate"), t(chocolate.chocolate), "§6"],
    [t("skyblock.allTimeChocolate"), t(chocolate.total), "§6"],
    [t("skyblock.sincePrestige"), t(chocolate.sincePrestige), "§6"],
    [t("skyblock.timeTower"), t(chocolate.timeTower), "§d"],
  ];

  const rabbits = chocolate.rabbits.map(({ rarity, found, total }) => (
    <Table.td title={prettify(rarity)} value={`${t(found)}§7/${t(total)}`} color={RARITY_COLORS[rarity]} size="small" />
  ));

  const employees = chocolate.employees.map(({ employee, level }) => (
    <Table.td title={prettify(employee)} value={t(level)} color="§a" size="small" />
  ));

  return (
    <Container background={background}>
      <Header skin={skin} name={profile.displayName} badge={badge} sidebar={sidebar} title={title} time="LIVE" />
      <Table.table>
        <Table.ts title={`§a${t("skyblock.rabbits")}`}>{gridRows(rabbits, COLUMNS)}</Table.ts>
        <Table.ts title={`§a${t("skyblock.employees")}`}>{gridRows(employees, COLUMNS)}</Table.ts>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
