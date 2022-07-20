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
import { FormattedGame, GameMode, QuakeModes } from "@statsify/schemas";

export interface QuakeProfileProps extends BaseProfileProps {
  mode: GameMode<QuakeModes>;
}

export const QuakeProfile = ({
  skin,
  player,
  background,
  logo,
  user,
  badge,
  mode,
  t,
  time,
}: QuakeProfileProps) => {
  const { quake } = player.stats;
  const stats = quake[mode.api];

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(quake.coins), "§6"],
    [t("stats.tokens"), t(quake.tokens), "§e"],
    [t("stats.godlikes"), t(quake.godlikes), "§3"],
    [t("stats.trigger"), `${quake.trigger}s`, "§b"],
    [t("stats.highestKillstreak"), t(quake.highestKillstreak), "§4"],
  ];

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.QUAKE} §fStats §r(${mode.formatted})`}
        description={`${formatProgression({
          t,
          progression: quake.progression,
          currentLevel: quake.currentPrefix,
          nextLevel: quake.nextPrefix,
        })}`}
        time={time}
      />
      <Table.table>
        <Table.tr>
          <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§a" />
          <Table.td title={t("stats.kwr")} value={t(stats.kwr)} color="§c" />
          <Table.td
            title={t("stats.killstreaks")}
            value={t(stats.killstreaks)}
            color="§6"
          />
        </Table.tr>
        <Table.tr>
          <Table.td
            title={t("stats.shotsFired")}
            value={t(stats.shotsFired)}
            color="§a"
          />
          <Table.td title={t("stats.headshots")} value={t(stats.headshots)} color="§c" />
          <Table.td
            title={t("stats.shotAccuracy")}
            value={`${stats.quakeShotAccuracy}%`}
            color="§6"
          />
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
