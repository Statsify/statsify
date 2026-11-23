/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, SidebarItem, Table } from "../components/index.js";
import { FormattedGame, type GameMode, SmashHeroesModes } from "@statsify/schemas";
import { SMASH_HEROES, cardColors } from "@statsify/catalog";
import { prettify } from "@statsify/util";
import type { BaseProfileProps } from "../types.js";

export interface SmashHeroesProfile extends BaseProfileProps {
  mode: GameMode<SmashHeroesModes>;
}

export const SmashHeroesProfile = ({
  skin,
  player,
  background,
  logo,
  user,
  badge,
  mode,
  t,
  time,
}: SmashHeroesProfile) => {
  const { smashheroes } = player.stats;
  const stats = smashheroes[mode.api];
  const color = cardColors(SMASH_HEROES, mode.api);

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(smashheroes.coins), color("coins")],
    [t("stats.level"), t(smashheroes.levelFormatted), color("levelFormatted")],
    [t("stats.class"), prettify(smashheroes.kit), color("kit")],
  ];

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.SMASH_HEROES} §fStats §r(${mode.formatted})`}
        time={time}
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
        </Table.tr>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
