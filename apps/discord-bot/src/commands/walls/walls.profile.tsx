/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BaseProfileProps } from "../base.hypixel-command.js";
import {
  Container,
  Footer,
  Header,
  SidebarItem,
  Table,
  formatProgression,
} from "#components";
import { FormattedGame } from "@statsify/schemas";

export const WallsProfile = ({
  skin,
  player,
  background,
  logo,
  user,
  badge,
  t,
  time,
}: BaseProfileProps) => {
  const { walls } = player.stats;

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(walls.coins), "§6"],
    [t("stats.tokens"), t(walls.tokens), "§e"],
  ];

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.WALLS} §fStats`}
        description={`§7${t("stats.prefix")}: ${walls.naturalPrefix}\n${formatProgression(
          {
            t,
            label: t("stats.progression.win"),
            progression: walls.progression,
            currentLevel: walls.currentPrefix,
            nextLevel: walls.nextPrefix,
          }
        )}`}
        time={time}
      />
      <Table.table>
        <Table.tr>
          <Table.td title={t("stats.wins")} value={t(walls.wins)} color="§a" />
          <Table.td title={t("stats.losses")} value={t(walls.losses)} color="§c" />
          <Table.td title={t("stats.wlr")} value={t(walls.wlr)} color="§6" />
        </Table.tr>
        <Table.tr>
          <Table.td title={t("stats.kills")} value={t(walls.kills)} color="§a" />
          <Table.td title={t("stats.deaths")} value={t(walls.deaths)} color="§c" />
          <Table.td title={t("stats.kdr")} value={t(walls.kdr)} color="§6" />
          <Table.td title={t("stats.assists")} value={t(walls.assists)} color="§e" />
        </Table.tr>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
