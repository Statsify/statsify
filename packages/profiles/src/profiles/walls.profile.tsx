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
import { FormattedGame } from "@statsify/schemas";
import { WALLS, cardColors } from "@statsify/catalog";
import type { BaseProfileProps } from "../types.js";

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
  const color = cardColors(WALLS);

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(walls.coins), color("coins")],
    [t("stats.tokens"), t(walls.tokens), color("tokens")],
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
          <Table.td title={t("stats.wins")} value={t(walls.wins)} color={color("wins")} />
          <Table.td title={t("stats.losses")} value={t(walls.losses)} color={color("losses")} />
          <Table.td title={t("stats.wlr")} value={t(walls.wlr)} color={color("wlr")} />
        </Table.tr>
        <Table.tr>
          <Table.td title={t("stats.kills")} value={t(walls.kills)} color={color("kills")} />
          <Table.td title={t("stats.deaths")} value={t(walls.deaths)} color={color("deaths")} />
          <Table.td title={t("stats.kdr")} value={t(walls.kdr)} color={color("kdr")} />
          <Table.td title={t("stats.assists")} value={t(walls.assists)} color={color("assists")} />
        </Table.tr>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
