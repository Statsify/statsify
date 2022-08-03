/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BaseProfileProps } from "../base.hypixel-command";
import {
  Container,
  Footer,
  Header,
  SidebarItem,
  Table,
  formatProgression,
} from "#components";
import { FormattedGame, GameMode, UHCModes } from "@statsify/schemas";
import { prettify } from "@statsify/util";

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

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(uhc.coins), "§6"],
    [t("stats.score"), t(uhc.score), "§b"],
    [t("stats.title"), uhc.title, "§e"],
    [t("stats.kit"), prettify(uhc.kit), "§a"],
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
          <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§e" />
          <Table.td title={t("stats.kills")} value={t(stats.kills)} color="§a" />
          <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color="§c" />
          <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color="§6" />
        </Table.tr>
        <Table.tr>
          <Table.td
            title={t("stats.headsEaten")}
            value={t(stats.headsEaten)}
            color="§6"
          />
          <Table.td
            title={t("stats.ultimatesCrafted")}
            value={t(stats.ultimatesCrafted)}
            color="§b"
          />
          <Table.td
            title={t("stats.extraUltimates")}
            value={t(stats.extraUltimates)}
            color="§d"
          />
        </Table.tr>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
