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
  Historical,
  SidebarItem,
  Table,
  formatProgression,
} from "../components/index.js";
import { FormattedGame, type GameMode, SkyWarsModes } from "@statsify/schemas";
import { SKYWARS, cardColors } from "@statsify/catalog";
import { formatTime, prettify } from "@statsify/util";
import type { BaseProfileProps } from "../types.js";

export interface SkyWarsProfileProps extends BaseProfileProps {
  mode: GameMode<SkyWarsModes>;
}

export const SkyWarsProfile = ({
  skin,
  player,
  background,
  logo,
  user,
  badge,
  mode,
  t,
  time,
}: SkyWarsProfileProps) => {
  const { skywars } = player.stats;
  const stats = skywars[mode.api];
  const color = cardColors(SKYWARS, mode.api);

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(skywars.coins), color("coins")],
    [t("stats.tokens"), t(skywars.tokens), color("tokens")],
    [t("stats.souls"), t(skywars.souls), color("souls")],
    [t("stats.opals"), t(skywars.opals), color("opals")],
    [t("stats.heads"), t(skywars.heads), color("heads")],
    [t("stats.potionsBrewed"), t(skywars.potionsBrewed), color("potionsBrewed")],
  ];

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.SKYWARS} Stats §r(${mode.formatted})`}
        description={`§7${t("stats.level")}: ${
          skywars.levelFormatted
        }\n${formatProgression({
          t,
          label: t("stats.progression.exp"),
          progression: skywars.progression,
          currentLevel: skywars.naturalLevelFormatted,
          nextLevel: skywars.nextLevelFormatted,
        })}`}
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
        <Table.tr>
          <Table.td title={t("stats.assists")} value={t(stats.assists)} color={color("assists")} />
          <Table.td
            title={t("stats.playtime")}
            value={formatTime(stats.playtime)}
            color={color("playtime")}
          />
          <Table.td title={t("stats.kit")} value={prettify(stats.kit)} color={color("kit")} />
        </Table.tr>
        <Historical.progression
          time={time}
          progression={skywars.progression}
          current={skywars.levelFormatted}
          next={skywars.nextLevelFormatted}
          t={t}
          level={skywars.level}
          exp={skywars.exp}
        />
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
