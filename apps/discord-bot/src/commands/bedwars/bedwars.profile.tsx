/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BedWarsMode, BedWarsModes, FormattedGame, type GameMode } from "@statsify/schemas";
import {
  Container,
  Footer,
  Header,
  Historical,
  SidebarItem,
  StatColumn,
  Table,
  formatProgression,
} from "#components";
import type { BaseProfileProps } from "#commands/base.hypixel-command";
import type { LocalizeFunction } from "@statsify/discord";

export function getBedWarsTable(stats: BedWarsMode, t: LocalizeFunction): StatColumn[][] {
  return [
    [
      { title: t("stats.wins"), color: "§a", value: stats.wins },
      { title: t("stats.losses"), color: "§c", value: stats.losses, lowerIsBetter: true },
      { title: t("stats.wlr"), color: "§6", value: stats.wlr },
    ],
    [
      { title: t("stats.finalKills"), color: "§a", value: stats.finalKills },
      { title: t("stats.finalDeaths"), color: "§c", value: stats.finalDeaths, lowerIsBetter: true },
      { title: t("stats.fkdr"), color: "§6", value: stats.fkdr },
    ],
    [
      { title: t("stats.kills"), color: "§a", value: stats.kills },
      { title: t("stats.deaths"), color: "§c", value: stats.deaths, lowerIsBetter: true },
      { title: t("stats.kdr"), color: "§6", value: stats.kdr },
    ],
    [
      { title: t("stats.bedsBroken"), color: "§a", value: stats.bedsBroken },
      { title: t("stats.bedsLost"), color: "§c", value: stats.bedsLost, lowerIsBetter: true },
      { title: t("stats.bblr"), color: "§6", value: stats.bblr },
    ],
  ];
}

export interface BedWarsProfileProps extends BaseProfileProps {
  mode: GameMode<BedWarsModes>;
}

export const BedWarsProfile = ({
  skin,
  player,
  background,
  logo,
  user,
  badge,
  mode,
  t,
  time,
}: BedWarsProfileProps) => {
  const { bedwars } = player.stats;
  const stats = bedwars[mode.api];

  const sidebar: SidebarItem[] = [
    [t("stats.tokens"), t(bedwars.tokens), "§2"],
    [t("stats.iron"), t(stats.itemsCollected.iron), "§7"],
    [t("stats.gold"), t(stats.itemsCollected.gold), "§6"],
    [t("stats.diamonds"), t(stats.itemsCollected.diamond), "§b"],
    [t("stats.emeralds"), t(stats.itemsCollected.emerald), "§2"],
  ];

  if (bedwars.slumber.wallet) sidebar.push(
    [t("stats.slumberTickets"), `${t(bedwars.slumber.tickets)}§7/${t(bedwars.slumber.wallet)}`, "§b"],
    [t("stats.totalSlumberTickets"), t(bedwars.slumber.totalTickets), "§d"]
  );

  if (time === "LIVE" && stats.winstreak) sidebar.push([t("stats.winstreak"), t(stats.winstreak), "§a"]);

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.BEDWARS} §fStats §r(${mode.formatted})`}
        description={`§7${t("stats.level")}: ${
          bedwars.levelFormatted
        }\n${formatProgression({
          t,
          label: t("stats.progression.exp"),
          progression: bedwars.progression,
          currentLevel: bedwars.levelFormatted,
          nextLevel: bedwars.nextLevelFormatted,
        })}`}
        time={time}
      />
      <Table.table>
        {[
          ...getBedWarsTable(stats, t).map((row) => (
            <Table.tr>
              {row.map((col) => (
                <Table.td title={col.title} value={t(col.value)} color={col.color} />
              ))}
            </Table.tr>
          )),
          <Historical.progression
            time={time}
            progression={bedwars.progression}
            current={bedwars.levelFormatted}
            next={bedwars.nextLevelFormatted}
            t={t}
            level={bedwars.level}
            exp={bedwars.exp}
          />,
        ]}
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
