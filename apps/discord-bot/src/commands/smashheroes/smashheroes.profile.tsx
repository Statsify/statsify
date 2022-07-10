/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BaseProfileProps } from "../base.hypixel-command";
import { Container, Footer, Header, SidebarItem, Table } from "#components";
import { FormattedGame, GameMode, SmashHeroesModes } from "@statsify/schemas";
import { prettify } from "@statsify/util";

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

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(smashheroes.coins), "§6"],
    [t("stats.class"), prettify(smashheroes.kit), "§b"],
  ];

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.SMASH_HEROES} §fStats §r(${mode.formatted})`}
        description={`${FormattedGame.SMASH_HEROES} §7Level: ${smashheroes.levelFormatted}`}
        time={time}
      />
      <Table.table>
        <Table.tr>
          <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§a" />
          <Table.td title={t("stats.losses")} value={t(stats.losses)} color="§c" />
          <Table.td title={t("stats.wlr")} value={t(stats.wlr)} color="§6" />
        </Table.tr>
        <Table.tr>
          <Table.td title={t("stats.kills")} value={t(stats.kills)} color="§a" />
          <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color="§c" />
          <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color="§6" />
        </Table.tr>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
