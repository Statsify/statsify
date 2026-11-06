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
import { WALLS, cardColours } from "@statsify/catalog";
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
  const colour = cardColours(WALLS);

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(walls.coins), colour("coins")],
    [t("stats.tokens"), t(walls.tokens), colour("tokens")],
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
          <Table.td title={t("stats.wins")} value={t(walls.wins)} color={colour("wins")} />
          <Table.td title={t("stats.losses")} value={t(walls.losses)} color={colour("losses")} />
          <Table.td title={t("stats.wlr")} value={t(walls.wlr)} color={colour("wlr")} />
        </Table.tr>
        <Table.tr>
          <Table.td title={t("stats.kills")} value={t(walls.kills)} color={colour("kills")} />
          <Table.td title={t("stats.deaths")} value={t(walls.deaths)} color={colour("deaths")} />
          <Table.td title={t("stats.kdr")} value={t(walls.kdr)} color={colour("kdr")} />
          <Table.td title={t("stats.assists")} value={t(walls.assists)} color={colour("assists")} />
        </Table.tr>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
