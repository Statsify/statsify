/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, type SidebarItem, Table } from "#components";
import { EmptySection } from "./components/EmptySection.js";
import { type LevelBarProps, levelBarRows } from "./components/LevelBar.js";
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
  const bars: LevelBarProps[] = skills ?
    SKILLS.map((name) => {
      const level = skills.skills[name];
      const pastMax = level.xpForNext === undefined && level.xpCurrent > 0 && !level.unverified ?
        [`§7${t("skyblock.xpPastMax", { xp: t(Math.floor(level.xpCurrent)) })}`] :
        [];

      return { title: prettify(name), level, color: SKILL_COLORS[name], t, notes: pastMax };
    }) :
    [];

  // A new profile has no skills of its own yet
  const highestSkills = profile.newProfile ? undefined : profile.player?.highestSkills;
  const highest = SKILLS.flatMap((name) => {
    const level = highestSkills?.[name];
    return level === undefined ? [] : [<Table.td title={prettify(name)} value={t(level)} color={SKILL_COLORS[name]} size="small" />];
  });

  return (
    <Container background={background}>
      <Header skin={skin} name={profile.displayName} badge={badge} sidebar={sidebar} title={title} time="LIVE" />
      {skills ?
        (
          <Table.table>{levelBarRows(bars, 3)}</Table.table>
        ) :
        highest.length > 0 ?
          (
            <Table.table>
              <Table.ts title={`§7${t("skyblock.highestOnAnyProfile")}`}>
                {arrayGroup(highest, 3).map((row) => <Table.tr>{row}</Table.tr>)}
              </Table.ts>
            </Table.table>
          ) :
          <EmptySection setting="skills" newProfile={profile.newProfile} empty={t("skyblock.noSkills")} t={t} />}
      <Footer logo={logo} user={user} />
    </Container>
  );
};
