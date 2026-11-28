/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Card } from "./components/Card.js";
import { type SidebarItem, Table } from "#components";
import { EmptySection } from "./components/EmptySection.js";
import { type LevelBarProps, getLevelBarRows } from "./components/LevelBar.js";
import { SKILLS, SKILL_COLORS } from "@statsify/skyblock/display";
import { prettify } from "@statsify/util";
import type { SkyBlockProfileProps } from "./skyblock.command.js";

export const SkyBlockSkillsProfile = ({
  profile,
  t,
  ...card
}: SkyBlockProfileProps) => {
  const { skills } = profile.member;

  const sidebar: SidebarItem[] = skills
    ? [[t("skyblock.skillAverage"), t(skills.average), "§a"]]
    : [];

  const bars: LevelBarProps[] = skills
    ? SKILLS.map((name) => {
        const level = skills.skills[name];
        const maxed = level.xpForNext === undefined && !level.unverified;
        const xp = t(Math.floor(level.xpCurrent));

        return {
          title: prettify(name),
          level,
          color: SKILL_COLORS[name],
          t,
          notes:
            maxed && level.xpCurrent > 0
              ? [`§7${t("skyblock.xpPastMax", { xp })}`]
              : [],
        };
      })
    : [];

  return (
    <Card {...card} name={profile.displayName} sidebar={sidebar}>
      {skills ? (
        // Four "XP past max" notes in one row set the card's width.
        <Table.table>{getLevelBarRows(bars, 3)}</Table.table>
      ) : (
        <EmptySection
          setting="skills"
          newProfile={profile.newProfile}
          empty={t("skyblock.noSkills")}
          t={t}
        />
      )}
    </Card>
  );
};
