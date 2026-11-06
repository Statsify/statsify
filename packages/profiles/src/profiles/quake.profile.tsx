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
import { QUAKE, cardColours } from "@statsify/catalog";
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
  const colour = cardColours(QUAKE, mode.api);

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(quake.coins), colour("coins")],
    [t("stats.tokens"), t(quake.tokens), colour("tokens")],
    [t("stats.godlikes"), t(quake.godlikes), colour("godlikes")],
    [t("stats.trigger"), `${t(quake.trigger)}s`, colour("trigger")],
    [t("stats.highestKillstreak"), t(quake.highestKillstreak), colour("highestKillstreak")],
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
          <Table.td title={t("stats.wins")} value={t(stats.wins)} color={colour("wins")} />
          <Table.td title={t("stats.kwr")} value={t(stats.kwr)} color={colour("kwr")} />
          <Table.td
            title={t("stats.killstreaks")}
            value={t(stats.killstreaks)}
            color={colour("killstreaks")}
          />
        </Table.tr>
        <Table.tr>
          <Table.td
            title={t("stats.shotsFired")}
            value={t(stats.shotsFired)}
            color={colour("shotsFired")}
          />
          <Table.td title={t("stats.headshots")} value={t(stats.headshots)} color={colour("headshots")} />
          <Table.td
            title={t("stats.shotAccuracy")}
            value={`${t(stats.quakeShotAccuracy)}%`}
            color={colour("quakeShotAccuracy")}
          />
        </Table.tr>
        <Table.tr>
          <Table.td title={t("stats.kills")} value={t(stats.kills)} color={colour("kills")} />
          <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color={colour("deaths")} />
          <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color={colour("kdr")} />
        </Table.tr>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
