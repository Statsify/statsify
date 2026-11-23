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
import { FormattedGame } from "@statsify/schemas";
import { PAINTBALL, cardColors } from "@statsify/catalog";
import { formatTime, prettify } from "@statsify/util";
import type { BaseProfileProps } from "../types.js";

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
  const color = cardColors(PAINTBALL);

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(paintball.coins), color("coins")],
    [t("stats.tokens"), t(paintball.tokens), color("tokens")],
    [t("stats.forcefieldTime"), formatTime(paintball.forcefieldTime), color("forcefieldTime")],
    [t("stats.hat"), prettify(paintball.hat), color("hat")],
    [t("stats.killstreaks"), t(paintball.killstreaks), color("killstreaks")],
  ];

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.PAINTBALL} §fStats`}
        description={`§7${t("stats.prefix")}: ${
          paintball.naturalPrefix
        }\n${formatProgression({
          t,
          label: t("stats.progression.kill"),
          progression: paintball.progression,
          currentLevel: paintball.currentPrefix,
          nextLevel: paintball.nextPrefix,
        })}`}
        time={time}
      />
      <Table.table>
        <Table.tr>
          <Table.td title={t("stats.wins")} value={t(paintball.wins)} color={color("wins")} />
          <Table.td
            title={t("stats.shotsFired")}
            value={t(paintball.shotsFired)}
            color={color("shotsFired")}
          />
          <Table.td
            title={t("stats.shotAccuracy")}
            value={`${t(paintball.shotAccuracy)}%`}
            color={color("shotAccuracy")}
          />
        </Table.tr>
        <Table.tr>
          <Table.td title={t("stats.kills")} value={t(paintball.kills)} color={color("kills")} />
          <Table.td title={t("stats.deaths")} value={t(paintball.deaths)} color={color("deaths")} />
          <Table.td title={t("stats.kdr")} value={t(paintball.kdr)} color={color("kdr")} />
        </Table.tr>
        <Historical.exclude time={time}>
          <Table.ts title="§6Perks">
            <Table.tr>
              <Table.td
                title={t("stats.adrenaline")}
                value={t(paintball.perks.adrenaline)}
                color={color("perks.adrenaline")}
                size="small"
              />
              <Table.td
                title={t("stats.endurance")}
                value={t(paintball.perks.endurance)}
                color={color("perks.endurance")}
                size="small"
              />
              <Table.td
                title={t("stats.fortune")}
                value={t(paintball.perks.fortune)}
                color={color("perks.fortune")}
                size="small"
              />
            </Table.tr>
            <Table.tr>
              <Table.td
                title={t("stats.godfather")}
                value={t(paintball.perks.godfather)}
                color={color("perks.godfather")}
                size="small"
              />
              <Table.td
                title={t("stats.headstart")}
                value={t(paintball.perks.headstart)}
                color={color("perks.headstart")}
                size="small"
              />
              <Table.td
                title={t("stats.superluck")}
                value={t(paintball.perks.superluck)}
                color={color("perks.superluck")}
                size="small"
              />
              <Table.td
                title={t("stats.transfusion")}
                value={t(paintball.perks.transfusion)}
                color={color("perks.transfusion")}
                size="small"
              />
            </Table.tr>
          </Table.ts>
        </Historical.exclude>
      </Table.table>

      <Footer logo={logo} user={user} />
    </Container>
  );
};
