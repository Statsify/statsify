/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ARENA_BRAWL, cardColours } from "@statsify/catalog";
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
  const colour = cardColours(ARENA_BRAWL, mode.api);

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(arenabrawl.coins), colour("coins")],
    [t("stats.tokens"), t(arenabrawl.tokens), colour("tokens")],
    [t("stats.magicalKeys"), t(arenabrawl.keys), colour("keys")],
    [t("stats.magicalChests"), t(arenabrawl.magicalChests), colour("magicalChests")],
    [t("stats.rune"), prettify(arenabrawl.rune), colour("rune")],
  ];

  if (time === "LIVE" && "winstreak" in stats && stats["winstreak"] > 0)
    sidebar.push([t("stats.winstreak"), t(stats.winstreak), colour("winstreak")]);

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
          <Table.td title={t("stats.wins")} value={t(stats.wins)} color={colour("wins")} />
          <Table.td title={t("stats.losses")} value={t(stats.losses)} color={colour("losses")} />
          <Table.td title={t("stats.wlr")} value={t(stats.wlr)} color={colour("wlr")} />
        </Table.tr>
        <Table.tr>
          <Table.td title={t("stats.kills")} value={t(stats.kills)} color={colour("kills")} />
          <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color={colour("deaths")} />
          <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color={colour("kdr")} />
        </Table.tr>
        <Historical.exclude time={time}>
          <Table.ts title="§6Skills">
            <Table.tr>
              <Table.td
                title={t("stats.offensive")}
                value={prettify(arenabrawl.offensive)}
                color={colour("offensive")}
                size="small"
              />
              <Table.td
                title={t("stats.utility")}
                value={prettify(arenabrawl.utility)}
                color={colour("utility")}
                size="small"
              />
            </Table.tr>
            <Table.tr>
              <Table.td
                title={t("stats.support")}
                value={prettify(arenabrawl.support)}
                color={colour("support")}
                size="small"
              />
              <Table.td
                title={t("stats.ultimate")}
                value={prettify(arenabrawl.ultimate)}
                color={colour("ultimate")}
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
