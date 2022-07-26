/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ArenaBrawlModes, FormattedGame, GameMode } from "@statsify/schemas";
import { BaseProfileProps } from "../base.hypixel-command";
import {
  Container,
  Footer,
  Header,
  Historical,
  SidebarItem,
  Table,
  formatProgression,
} from "#components";
import { prettify } from "@statsify/util";

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

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(arenabrawl.coins), "§6"],
    [t("stats.tokens"), t(arenabrawl.tokens), "§e"],
    [t("stats.magicalKeys"), t(arenabrawl.keys), "§b"],
    [t("stats.magicalChests"), t(arenabrawl.magicalChests), "§5"],
    [t("stats.rune"), prettify(arenabrawl.rune), "§9"],
  ];

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.ARENA_BRAWL} §fStats §r(${mode.formatted})`}
        description={`§7Prefix: ${arenabrawl.naturalPrefix}\n§7Win ${formatProgression({
          t,
          progression: arenabrawl.progression,
          currentLevel: arenabrawl.currentPrefix,
          nextLevel: arenabrawl.nextPrefix,
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
        <Historical.exclude time={time}>
          <Table.ts title="§6Skills">
            <Table.tr>
              <Table.td
                title={t("stats.offensive")}
                value={prettify(arenabrawl.offensive)}
                color="§c"
                size="small"
              />
              <Table.td
                title={t("stats.utility")}
                value={prettify(arenabrawl.utility)}
                color="§e"
                size="small"
              />
            </Table.tr>
            <Table.tr>
              <Table.td
                title={t("stats.support")}
                value={prettify(arenabrawl.support)}
                color="§a"
                size="small"
              />
              <Table.td
                title={t("stats.ultimate")}
                value={prettify(arenabrawl.ultimate)}
                color="§6"
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
