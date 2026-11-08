/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, type SidebarItem, Table } from "#components";
import { LevelBar } from "./components/LevelBar.js";
import { BOSS_COLORS, SLAYER_BOSSES } from "@statsify/skyblock/display";
import { arrayGroup, prettify, romanNumeral } from "@statsify/util";
import type { SkyBlockProfileProps } from "./skyblock.command.js";

export const SkyBlockSlayersProfile = ({
  profile,
  title,
  skin,
  badge,
  background,
  logo,
  user,
  t,
}: SkyBlockProfileProps) => {
  const slayers = profile.member.slayers!;

  const sidebar: SidebarItem[] = [[t("skyblock.slayerXp"), t(slayers.xp), "§5"]];

  const cells = SLAYER_BOSSES.map((name) => {
    const { level, kills } = slayers.bosses[name];
    const tiers = kills.map((count, tier) => `§7${romanNumeral(tier + 1)} §f${t(count)}`);

    // On one line, the longest boss's tier counts set every cell's width
    const lines = arrayGroup(tiers, Math.ceil(tiers.length / 2));

    return (
      <LevelBar
        title={prettify(name)}
        level={level}
        color={BOSS_COLORS[name]}
        t={t}
        notes={lines.map((line) => line.join("§8 • "))}
      />
    );
  });

  return (
    <Container background={background}>
      <Header skin={skin} name={profile.displayName} badge={badge} sidebar={sidebar} title={title} time="LIVE" />
      <Table.table>
        {arrayGroup(cells, 3).map((row) => (
          <Table.tr>{row}</Table.tr>
        ))}
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
