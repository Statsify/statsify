/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BaseProfileProps } from "../base.hypixel-command";
import { Container, Footer, Header, SidebarItem, Table } from "#components";
import { FormattedGame, QUAKE_MODES } from "@statsify/schemas";
import { prettify } from "@statsify/util";

export interface QuakeProfileProps extends BaseProfileProps {
  mode: typeof QUAKE_MODES[number];
}

export const QuakeProfile = ({
  skin,
  player,
  background,
  logo,
  tier,
  badge,
  mode,
  t,
  time,
}: QuakeProfileProps) => {
  const { quake } = player.stats;
  const stats = quake[mode];

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(quake.coins), "§6"],
    [t("stats.godlikes"), t(quake.godlikes), "§e"],
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
        title={`§l${FormattedGame.QUAKE} §fStats §r(${prettify(mode)})`}
        time={time}
      />
      <Table.table>
        <Table.tr>
          <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§a" />
          <Table.td title={t("stats.winRate")} value={`${stats.winRate}%`} color="§c" />
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
            value={`${stats.shotAccuracy}%`}
            color="§6"
          />
        </Table.tr>
        <Table.tr>
          <Table.td title={t("stats.kills")} value={t(stats.kills)} color="§a" />
          <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color="§c" />
          <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color="§6" />
        </Table.tr>
      </Table.table>
      <Footer logo={logo} tier={tier} />
    </Container>
  );
};
