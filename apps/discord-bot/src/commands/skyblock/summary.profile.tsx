/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, type SidebarItem, Table } from "#components";
import type { SkyBlockProfileProps } from "./skyblock.command.js";

export const SkyBlockSummaryProfile = ({
  profile,
  title,
  skin,
  badge,
  background,
  logo,
  user,
  t,
}: SkyBlockProfileProps) => {
  const { skills, dungeons, slayers, accessories, networth } = profile.member;
  const apiOff = t("skyblock.apiOff");

  const sidebar: SidebarItem[] = [
    [t("skyblock.level"), t(profile.level), profile.levelColor],
    [t("skyblock.purse"), t(Math.floor(profile.purse)), "§6"],
    profile.bank === undefined ?
      [t("skyblock.bank"), apiOff, "§c"] :
      [t("skyblock.bank"), t(Math.floor(profile.bank)), "§6"],
  ];

  if (profile.personalBank !== undefined)
    sidebar.push([t("skyblock.personalBank"), t(Math.floor(profile.personalBank)), "§6"]);

  return (
    <Container background={background}>
      <Header skin={skin} name={profile.displayName} badge={badge} sidebar={sidebar} title={title} time="LIVE" />
      <Table.table>
        <Table.tr>
          <Table.td title={t("skyblock.networth")} value={t(Math.floor(networth!.total))} color="§6" />
          <Table.td
            title={t("skyblock.nonCosmeticNetworth")}
            value={t(Math.floor(networth!.nonCosmetic.total))}
            color="§e"
          />
        </Table.tr>
        <Table.tr>
          <Table.td title={t("skyblock.skillAverage")} value={skills ? t(skills.average) : apiOff} color={skills ? "§a" : "§c"} />
          <Table.td title={t("skyblock.catacombs")} value={t(dungeons!.catacombs.level)} color="§c" />
          <Table.td title={t("skyblock.classAverage")} value={t(dungeons!.classAverage)} color="§2" />
        </Table.tr>
        <Table.tr>
          <Table.td title={t("skyblock.slayerXp")} value={t(slayers!.xp)} color="§5" />
          <Table.td
            title={t("skyblock.accessoryPower")}
            value={accessories ? t(accessories.accessoryPower) : apiOff}
            color={accessories ? "§d" : "§c"}
          />
          <Table.td title={t("skyblock.fairySouls")} value={t(profile.fairySouls)} color="§d" />
        </Table.tr>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
