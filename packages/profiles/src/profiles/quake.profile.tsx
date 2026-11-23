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
import { FormattedGame, type GameMode, QuakeModes } from "@statsify/schemas";
import { QUAKE, cardColors } from "@statsify/catalog";
import type { BaseProfileProps } from "../types.js";

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
  const color = cardColors(QUAKE, mode.api);

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(quake.coins), color("coins")],
    [t("stats.tokens"), t(quake.tokens), color("tokens")],
    [t("stats.godlikes"), t(quake.godlikes), color("godlikes")],
    [t("stats.trigger"), `${t(quake.trigger)}s`, color("trigger")],
    [t("stats.highestKillstreak"), t(quake.highestKillstreak), color("highestKillstreak")],
  ];

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.QUAKE} §fStats §r(${mode.formatted})`}
        description={`§7${t("stats.prefix")}: ${quake.naturalPrefix}\n${formatProgression(
          {
            t,
            label: t("stats.progression.kill"),
            progression: quake.progression,
            currentLevel: quake.currentPrefix,
            nextLevel: quake.nextPrefix,
          }
        )}`}
        time={time}
      />
      <Table.table>
        <Table.tr>
          <Table.td title={t("stats.wins")} value={t(stats.wins)} color={color("wins")} />
          <Table.td title={t("stats.kwr")} value={t(stats.kwr)} color={color("kwr")} />
          <Table.td
            title={t("stats.killstreaks")}
            value={t(stats.killstreaks)}
            color={color("killstreaks")}
          />
        </Table.tr>
        <Table.tr>
          <Table.td
            title={t("stats.shotsFired")}
            value={t(stats.shotsFired)}
            color={color("shotsFired")}
          />
          <Table.td title={t("stats.headshots")} value={t(stats.headshots)} color={color("headshots")} />
          <Table.td
            title={t("stats.shotAccuracy")}
            value={`${t(stats.quakeShotAccuracy)}%`}
            color={color("quakeShotAccuracy")}
          />
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
