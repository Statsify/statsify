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
  SidebarItem,
  Table,
  formatProgression,
} from "../components/index.js";
import { FormattedGame, type GameMode, UHCModes } from "@statsify/schemas";
import { UHC, cardColors } from "@statsify/catalog";
import { prettify } from "@statsify/util";
import type { BaseProfileProps } from "../types.js";

export interface UHCProfileProps extends BaseProfileProps {
  mode: GameMode<UHCModes>;
}

export const UHCProfile = ({
  skin,
  player,
  background,
  logo,
  user,
  badge,
  mode,
  t,
  time,
}: UHCProfileProps) => {
  const { uhc } = player.stats;
  const stats = uhc[mode.api];
  const color = cardColors(UHC, mode.api);

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(uhc.coins), color("coins")],
    [t("stats.score"), t(uhc.score), color("score")],
    [t("stats.title"), uhc.title, color("title")],
    [t("stats.kit"), prettify(uhc.kit), color("kit")],
  ];

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.UHC} §fStats §r(${mode.formatted})`}
        description={`§7${t("stats.level")}: ${uhc.levelFormatted}\n${formatProgression({
          t,
          label: t("stats.progression.score"),
          progression: uhc.progression,
          currentLevel: uhc.levelFormatted,
          nextLevel: uhc.nextLevelFormatted,
        })}`}
        time={time}
        historicalSidebar
      />
      <Table.table>
        <Table.tr>
          <Table.td title={t("stats.wins")} value={t(stats.wins)} color={color("wins")} />
          <Table.td title={t("stats.kills")} value={t(stats.kills)} color={color("kills")} />
          <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color={color("deaths")} />
          <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color={color("kdr")} />
        </Table.tr>
        <Table.tr>
          <Table.td
            title={t("stats.headsEaten")}
            value={t(stats.headsEaten)}
            color={color("headsEaten")}
          />
          <Table.td
            title={t("stats.ultimatesCrafted")}
            value={t(stats.ultimatesCrafted)}
            color={color("ultimatesCrafted")}
          />
          <Table.td
            title={t("stats.extraUltimates")}
            value={t(stats.extraUltimates)}
            color={color("extraUltimates")}
          />
        </Table.tr>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
