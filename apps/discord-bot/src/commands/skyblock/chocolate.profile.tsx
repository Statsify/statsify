/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, type SidebarItem, Table } from "#components";
import { Empty } from "./components/Empty.js";
import { RARITY_COLORS } from "@statsify/skyblock/display";
import { arrayGroup, prettify, romanNumeral } from "@statsify/util";
import type { SkyBlockProfileProps } from "./skyblock.command.js";

// The employees whose id isn't their name in the factory (the wiki's Chocolate Factory page)
const EMPLOYEE_NAMES: Record<string, string> = { rabbit_father: "Rabbit Daddy", rabbit_grandma: "Rabbit Granny" };

const COLUMNS = 4;

// Not gridRows: a short last row shares the full width instead of leaving an empty cell
const rows = (cells: JSX.Element[]) => arrayGroup(cells, COLUMNS).map((row) => <Table.tr>{row}</Table.tr>);

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
    [
      t("skyblock.sincePrestige"),
      chocolate.nextPrestige === undefined ?
        t(chocolate.sincePrestige) :
        `${t(chocolate.sincePrestige)}§7/§6${t(chocolate.nextPrestige)}`,
      "§6",
    ],
    [t("skyblock.timeTower"), t(chocolate.timeTower), "§d"],
    [t("skyblock.duplicateRabbits"), t(chocolate.duplicates), "§a"],
    [t("skyblock.eggLocations"), t(chocolate.eggLocations), "§b"],
  ];

  const rabbits = chocolate.rabbits.map(({ rarity, found, total }) => (
    <Table.td title={prettify(rarity)} value={`${t(found)}§7/${t(total)}`} color={RARITY_COLORS[rarity]} size="small" />
  ));

  const employees = chocolate.employees.map(({ employee, level }) => (
    <Table.td title={EMPLOYEE_NAMES[employee] ?? prettify(employee)} value={t(level)} color="§a" size="small" />
  ));

  return (
    <Container background={background}>
      <Header skin={skin} name={profile.displayName} badge={badge} sidebar={sidebar} title={title} time="LIVE" />
      <Table.table>
        <Table.ts title={`§a${t("skyblock.rabbits")}`}>{rows(rabbits)}</Table.ts>
        <Table.ts title={`§a${t("skyblock.employees")}`}>{rows(employees)}</Table.ts>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
