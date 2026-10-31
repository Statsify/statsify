/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, type SidebarItem, Table } from "#components";
import { EmptySection } from "./components/EmptySection.js";
import { LevelBar } from "./components/LevelBar.js";
import { SKILLS, type Skill } from "@statsify/skyblock";
import { arrayGroup, prettify } from "@statsify/util";
import type { SkyBlockProfileProps } from "./skyblock.command.js";

const SKILL_COLORS: Record<Skill, string> = {
  farming: "§e",
  mining: "§7",
  combat: "§c",
  foraging: "§2",
  fishing: "§3",
  enchanting: "§5",
  alchemy: "§d",
  taming: "§a",
  carpentry: "§6",
  hunting: "§b",
  runecrafting: "§d",
  social: "§a",
};

export const SkyBlockSkillsProfile = ({
  profile,
  title,
  skin,
  badge,
  background,
  logo,
  user,
  t,
}: SkyBlockProfileProps) => {
  const { skills } = profile.member;

  const sidebar: SidebarItem[] = skills ? [[t("skyblock.skillAverage"), t(skills.average), "§a"]] : [];

  const cells = skills ?
    SKILLS.map((name) => (
      <LevelBar title={prettify(name)} level={skills.skills[name]} color={SKILL_COLORS[name]} t={t} />
    )) :
    [];

  return (
    <Container background={background}>
      <Header skin={skin} name={profile.displayName} badge={badge} sidebar={sidebar} title={title} time="LIVE" />
      {skills ?
        (
          <Table.table>
            {arrayGroup(cells, 4).map((row) => (
              <Table.tr>{row}</Table.tr>
            ))}
          </Table.table>
        ) :
        <EmptySection setting="skills" t={t} />}
      <Footer logo={logo} user={user} />
    </Container>
  );
};
