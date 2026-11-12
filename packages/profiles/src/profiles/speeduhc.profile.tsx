/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  Container,
  Footer,
  Header,
  If,
  SidebarItem,
  Table,
  formatProgression,
} from "../components/index.js";
import { FormattedGame, type GameMode, SpeedUHCMode, SpeedUHCModes } from "@statsify/schemas";
import { SPEED_UHC, cardColors } from "@statsify/catalog";
import { prettify } from "@statsify/util";
import type { BaseProfileProps } from "../types.js";

export interface SpeedUHCProfileProps extends BaseProfileProps {
  mode: GameMode<SpeedUHCModes>;
}

export const SpeedUHCProfile = ({
  skin,
  player,
  background,
  logo,
  user,
  badge,
  mode,
  t,
  time,
}: SpeedUHCProfileProps) => {
  const { speeduhc } = player.stats;
  const stats = speeduhc[mode.api];
  const color = cardColors(SPEED_UHC, mode.api);

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(speeduhc.coins), color("coins")],
    [t("stats.score"), t(speeduhc.score), color("score")],
    [t("stats.title"), speeduhc.title, color("title")],
    [t("stats.mastery"), prettify(speeduhc.activeMastery), color("activeMastery")],
  ];

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.SPEED_UHC} §fStats §r(${mode.formatted})`}
        description={`§7${t("stats.level")}: ${
          speeduhc.levelFormatted
        }\n${formatProgression({
          t,
          label: t("stats.progression.score"),
          progression: speeduhc.progression,
          currentLevel: speeduhc.levelFormatted,
          nextLevel: speeduhc.nextLevelFormatted,
        })}`}
        time={time}
        historicalSidebar
      />
      <Table.table>
        <Table.tr>
          <Table.td title={t("stats.wins")} value={t(stats.wins)} color={color("wins")} />
          <Table.td title={t("stats.losses")} value={t(stats.losses)} color={color("losses")} />
          <Table.td title={t("stats.wlr")} value={t(stats.wlr)} color={color("wlr")} />
        </Table.tr>
        <Table.tr>
          <Table.td title={t("stats.kills")} value={t(stats.kills)} color={color("kills")} />
          <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color={color("deaths")} />
          <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color={color("kdr")} />
          <If condition={Boolean("assists" in stats)}>
            {() => (
              <Table.td
                title={t("stats.assists")}
                value={t((stats as SpeedUHCMode).assists ?? 0)}
                color={color("assists")}
              />
            )}
          </If>
        </Table.tr>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
