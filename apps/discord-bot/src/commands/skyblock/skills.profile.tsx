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
import { SKILLS, SKILL_COLORS } from "@statsify/skyblock/display";
import { arrayGroup, prettify } from "@statsify/util";
import type { SkyBlockProfileProps } from "./skyblock.command.js";

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

  // Laid out three to a row: four "XP past max" notes in one row set the card's width
  const cells = skills ?
    SKILLS.map((name) => {
      const level = skills.skills[name];
      const pastMax = level.xpForNext === undefined && level.xpCurrent > 0 && !level.unverified ?
        `§7${t("skyblock.xpPastMax", { xp: t(Math.floor(level.xpCurrent)) })}` :
        undefined;

      return <LevelBar title={prettify(name)} level={level} color={SKILL_COLORS[name]} t={t} note={pastMax} />;
    }) :
    [];

  return (
    <Container background={background}>
      <Header skin={skin} name={profile.displayName} badge={badge} sidebar={sidebar} title={title} time="LIVE" />
      {skills ?
        (
          <Table.table>
            {arrayGroup(cells, 3).map((row) => (
              <Table.tr>{row}</Table.tr>
            ))}
          </Table.table>
        ) :
        <EmptySection setting="skills" newProfile={profile.newProfile} empty={t("skyblock.noSkills")} t={t} />}
      <Footer logo={logo} user={user} />
    </Container>
  );
};
