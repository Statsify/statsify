/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, type SidebarItem, Table } from "#components";
import { LevelBar } from "./components/LevelBar.js";
import { BOSS_COLORS } from "@statsify/skyblock/display";
import { SLAYER_BOSSES } from "@statsify/skyblock";
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

    return (
      <box direction="column" location="center" width="100%" padding={0}>
        <LevelBar title={prettify(name)} level={level} color={BOSS_COLORS[name]} t={t} />
        <text margin={{ top: 0, bottom: 8, left: 10, right: 10 }}>
          {kills.map((count, tier) => `§7${romanNumeral(tier + 1)} §f${t(count)}`).join("§8 • ")}
        </text>
      </box>
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
