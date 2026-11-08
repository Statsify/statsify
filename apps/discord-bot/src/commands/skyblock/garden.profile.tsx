/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, type SidebarItem, Table } from "#components";
import { Empty } from "./components/Empty.js";
import { ItemGrid } from "./components/ItemGrid.js";
import { LevelBar } from "./components/LevelBar.js";
import { arrayGroup } from "@statsify/util";
import type { MemberView } from "@statsify/skyblock";
import type { SkyBlockProfileProps } from "./skyblock.command.js";

export const gardenIcons = ({ garden }: MemberView) =>
  garden?.garden?.crops.flatMap(({ texture }) => (texture ? [texture] : [])) ?? [];

export const SkyBlockGardenProfile = ({
  profile,
  title,
  skin,
  badge,
  background,
  logo,
  user,
  t,
  icons,
}: SkyBlockProfileProps) => {
  const section = profile.member.garden;
  const garden = section?.garden;

  const memberSidebar: SidebarItem[] = section ?
    [
      [t("skyblock.copper"), t(section.copper), "§c"],
      [t("skyblock.greenhouseCrops"), t(section.greenhouse.length), "§d"],
      [t("skyblock.analyzed"), t(section.greenhouse.filter(({ analyzed }) => analyzed).length), "§d"],
    ] :
    [];

  if (!garden) {
    return (
      <Container background={background}>
        <Header skin={skin} name={profile.displayName} badge={badge} sidebar={memberSidebar} title={title} time="LIVE" />
        <Empty text={t(profile.gardenFetchedAt === undefined ? "skyblock.gardenNotLoaded" : "skyblock.noGarden")} />
        <Footer logo={logo} user={user} />
      </Container>
    );
  }

  const sidebar: SidebarItem[] = [
    ...memberSidebar,
    [t("skyblock.plots"), `${t(garden.plots.unlocked)}§7/${t(garden.plots.total)}`, "§e"],
    [t("skyblock.visitorsServed"), t(garden.visitors.served), "§a"],
    [t("skyblock.uniqueVisitors"), t(garden.visitors.unique), "§a"],
  ];

  const { level } = garden;
  const pastMax = level.xpForNext === undefined && level.xpCurrent > 0 ?
    [`§7${t("skyblock.xpPastMax", { xp: t(Math.floor(level.xpCurrent)) })}`] :
    [];

  const crops = garden.crops.map(({ name, texture, milestone, upgrade }) => {
    const tierColor = milestone.xpForNext === undefined ? "§6" : "§e";
    const upgradeColor = upgrade.level === upgrade.maxLevel ? "§6" : "§a";

    return {
      texture,
      name: `§f${name}`,
      value: `${tierColor}${t("skyblock.milestoneTier", { tier: milestone.level })} §8• ${upgradeColor}${t("skyblock.cropUpgrade", { level: upgrade.level })}`,
    };
  });

  const composter = garden.composter.map(({ name, level, maxLevel }) => (
    <Table.td title={name} value={`${t(level)}§7/${t(maxLevel)}`} color="§2" size="small" />
  ));

  return (
    <Container background={background}>
      <Header skin={skin} name={profile.displayName} badge={badge} sidebar={sidebar} title={title} time="LIVE" />
      <Table.table>
        <Table.tr>
          <LevelBar title={t("skyblock.gardenLevel")} level={level} color="§a" t={t} notes={pastMax} />
        </Table.tr>
      </Table.table>
      <ItemGrid items={crops} icons={icons} columns={2} spreadLastRow />
      <Table.table>
        {/* Five upgrades in one row set the card's width, so they wrap three and two */}
        <Table.ts title={`§2${t("skyblock.composter")}`}>
          {arrayGroup(composter, 3).map((row) => <Table.tr>{row}</Table.tr>)}
        </Table.ts>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
