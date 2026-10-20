/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  Container,
  Footer,
  Header,
  Historical,
  If,
  SidebarItem,
  Table,
  formatProgression,
} from "#components";
import { FormattedGame, type GameMode, SkyWarsModes } from "@statsify/schemas";
import { formatTime, prettify } from "@statsify/util";
import type { BaseProfileProps } from "#commands/base.hypixel-command";

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

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(skywars.coins), "§6"],
    [t("stats.tokens"), t(skywars.tokens), "§2"],
    [t("stats.souls"), t(skywars.souls), "§b"],
    [t("stats.opals"), t(skywars.opals), "§9"],
    [t("stats.heads"), t(skywars.heads), "§5"],
    [t("stats.potionsBrewed"), t(skywars.potionsBrewed), "§d"],
  ];

  // Solo and Doubles share the player's Normal and Insane kit picks, so their pages show both.
  // Overall shows the kit for whichever of Normal or Insane they've won more in
  const showBothKits = mode.api === "solo" || mode.api === "doubles";

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
          <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§a" />
          <Table.td title={t("stats.losses")} value={t(stats.losses)} color="§c" />
          <Table.td title={t("stats.wlr")} value={t(stats.wlr)} color="§6" />
        </Table.tr>
        <Table.tr>
          <Table.td title={t("stats.kills")} value={t(stats.kills)} color="§a" />
          <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color="§c" />
          <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color="§6" />
        </Table.tr>
        <Table.tr>
          <Table.td title={t("stats.assists")} value={t(stats.assists)} color="§a" />
          <Table.td
            title={t("stats.playtime")}
            value={formatTime(stats.playtime)}
            color="§c"
          />
          <If condition={!showBothKits}>
            <Table.td title={t("stats.kit")} value={prettify(stats.kit)} color="§6" />
          </If>
        </Table.tr>
        <If condition={showBothKits}>
          <Table.tr>
            <Table.td title={t("stats.normalKit")} value={prettify(skywars.normalKit)} color="§6" />
            <Table.td title={t("stats.insaneKit")} value={prettify(skywars.insaneKit)} color="§6" />
          </Table.tr>
        </If>
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
