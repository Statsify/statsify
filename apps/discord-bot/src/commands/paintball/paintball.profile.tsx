/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BaseProfileProps } from "../base.hypixel-command";
import { Container, Footer, Header, SidebarItem, Table } from "#components";
import { FormattedGame } from "@statsify/schemas";
import { formatTime, prettify } from "@statsify/util";

export const PaintballProfile = ({
  skin,
  player,
  background,
  logo,
  user,
  badge,
  t,
  time,
}: BaseProfileProps) => {
  const { paintball } = player.stats;

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(paintball.coins), "§6"],
    [t("stats.forcefieldTime"), formatTime(paintball.forcefieldTime), "§e"],
    [t("stats.hat"), prettify(paintball.hat), "§7"],
    [t("stats.killstreaks"), t(paintball.killstreaks), "§b"],
  ];

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.PAINTBALL} §fStats`}
        time={time}
      />
      <Table.table>
        <Table.tr>
          <Table.td title={t("stats.wins")} value={t(paintball.wins)} color="§a" />
          <Table.td
            title={t("stats.shotsFired")}
            value={t(paintball.shotsFired)}
            color="§c"
          />
          <Table.td
            title={t("stats.shotAccuracy")}
            value={`${paintball.shotAccuracy}%`}
            color="§6"
          />
        </Table.tr>
        <Table.tr>
          <Table.td title={t("stats.kills")} value={t(paintball.kills)} color="§a" />
          <Table.td title={t("stats.deaths")} value={t(paintball.deaths)} color="§c" />
          <Table.td title={t("stats.kdr")} value={t(paintball.kdr)} color="§6" />
        </Table.tr>
        <Table.ts title={`§6Perks`}>
          <Table.tr>
            <Table.td
              title={t("stats.adrenaline")}
              value={t(paintball.perks.adrenaline)}
              color="§4"
              size="small"
            />
            <Table.td
              title={t("stats.endurance")}
              value={t(paintball.perks.endurance)}
              color="§d"
              size="small"
            />
            <Table.td
              title={t("stats.fortune")}
              value={t(paintball.perks.fortune)}
              color="§2"
              size="small"
            />
          </Table.tr>
          <Table.tr>
            <Table.td
              title={t("stats.godfather")}
              value={t(paintball.perks.godfather)}
              color="§e"
              size="small"
            />
            <Table.td
              title={t("stats.headstart")}
              value={t(paintball.perks.headstart)}
              color="§c"
              size="small"
            />
            <Table.td
              title={t("stats.superluck")}
              value={t(paintball.perks.superluck)}
              color="§6"
              size="small"
            />
            <Table.td
              title={t("stats.transfusion")}
              value={t(paintball.perks.transfusion)}
              color="§b"
              size="small"
            />
          </Table.tr>
        </Table.ts>
      </Table.table>

      <Footer logo={logo} user={user} />
    </Container>
  );
};
