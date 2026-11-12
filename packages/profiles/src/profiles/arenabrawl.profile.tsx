/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ARENA_BRAWL, cardColors } from "@statsify/catalog";
import { ArenaBrawlModes, FormattedGame, type GameMode } from "@statsify/schemas";
import {
  Container,
  Footer,
  Header,
  Historical,
  SidebarItem,
  Table,
  formatProgression,
} from "../components/index.js";
import { prettify } from "@statsify/util";
import type { BaseProfileProps } from "../types.js";

export interface ArenaBrawlProfileProps extends BaseProfileProps {
  mode: GameMode<ArenaBrawlModes>;
}

export const ArenaBrawlProfile = ({
  skin,
  player,
  background,
  logo,
  user,
  badge,
  mode,
  t,
  time,
}: ArenaBrawlProfileProps) => {
  const { arenabrawl } = player.stats;
  const stats = arenabrawl[mode.api];
  const color = cardColors(ARENA_BRAWL, mode.api);

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(arenabrawl.coins), color("coins")],
    [t("stats.tokens"), t(arenabrawl.tokens), color("tokens")],
    [t("stats.magicalKeys"), t(arenabrawl.keys), color("keys")],
    [t("stats.magicalChests"), t(arenabrawl.magicalChests), color("magicalChests")],
    [t("stats.rune"), prettify(arenabrawl.rune), color("rune")],
  ];

  if (time === "LIVE" && "winstreak" in stats && stats["winstreak"] > 0)
    sidebar.push([t("stats.winstreak"), t(stats.winstreak), color("winstreak")]);

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.ARENA_BRAWL} §fStats §r(${mode.formatted})`}
        description={`§7${t("stats.prefix")}: ${
          arenabrawl.naturalPrefix
        }\n${formatProgression({
          t,
          label: t("stats.progression.win"),
          progression: arenabrawl.progression,
          currentLevel: arenabrawl.currentPrefix,
          nextLevel: arenabrawl.nextPrefix,
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
        <Historical.exclude time={time}>
          <Table.ts title="§6Skills">
            <Table.tr>
              <Table.td
                title={t("stats.offensive")}
                value={prettify(arenabrawl.offensive)}
                color={color("offensive")}
                size="small"
              />
              <Table.td
                title={t("stats.utility")}
                value={prettify(arenabrawl.utility)}
                color={color("utility")}
                size="small"
              />
            </Table.tr>
            <Table.tr>
              <Table.td
                title={t("stats.support")}
                value={prettify(arenabrawl.support)}
                color={color("support")}
                size="small"
              />
              <Table.td
                title={t("stats.ultimate")}
                value={prettify(arenabrawl.ultimate)}
                color={color("ultimate")}
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
