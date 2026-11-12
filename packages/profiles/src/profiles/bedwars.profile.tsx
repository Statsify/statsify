/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BEDWARS, cardColors } from "@statsify/catalog";
import { BedWarsModes, FormattedGame, type GameMode } from "@statsify/schemas";
import {
  Container,
  Footer,
  Header,
  Historical,
  SidebarItem,
  Table,
  formatProgression,
} from "../components/index.js";
import type { BaseProfileProps } from "../types.js";

export interface BedWarsProfileProps extends BaseProfileProps {
  mode: Exclude<GameMode<BedWarsModes>, { api: "challenges" }>;
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

  // Every stat's color comes from the catalog the site shares, so the card and the site draw each stat alike.
  const color = cardColors(BEDWARS, mode.api);

  const sidebar: SidebarItem[] = [
    [t("stats.tokens"), t(bedwars.tokens), color("tokens")],
    [t("stats.iron"), t(stats.itemsCollected.iron), color("itemsCollected.iron")],
    [t("stats.gold"), t(stats.itemsCollected.gold), color("itemsCollected.gold")],
    [t("stats.diamonds"), t(stats.itemsCollected.diamond), color("itemsCollected.diamond")],
    [t("stats.emeralds"), t(stats.itemsCollected.emerald), color("itemsCollected.emerald")],
  ];

  if (bedwars.slumber.wallet)
    sidebar.push(
      [
        t("stats.slumberTickets"),
        `${t(bedwars.slumber.tickets)}§7/${t(bedwars.slumber.wallet)}`,
        color("slumber.tickets"),
      ],
      [t("stats.totalSlumberTickets"), t(bedwars.slumber.totalTickets), color("slumber.totalTickets")],
    );

  if (time === "LIVE" && stats.winstreak)
    sidebar.push([t("stats.winstreak"), t(stats.winstreak), color("winstreak")]);

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
          currentLevel: bedwars.naturalLevelFormatted,
          nextLevel: bedwars.nextLevelFormatted,
        })}`}
        time={time}
      />
      <Table.table>
        <Table.tr>
          <Table.td title={t("stats.wins")} value={t(stats.wins)} color={color("wins")} />
          <Table.td
            title={t("stats.losses")}
            value={t(stats.losses)}
            color={color("losses")}
          />
          <Table.td title={t("stats.wlr")} value={t(stats.wlr)} color={color("wlr")} />
        </Table.tr>
        <Table.tr>
          <Table.td
            title={t("stats.finalKills")}
            value={t(stats.finalKills)}
            color={color("finalKills")}
          />
          <Table.td
            title={t("stats.finalDeaths")}
            value={t(stats.finalDeaths)}
            color={color("finalDeaths")}
          />
          <Table.td title={t("stats.fkdr")} value={t(stats.fkdr)} color={color("fkdr")} />
        </Table.tr>
        <Table.tr>
          <Table.td
            title={t("stats.kills")}
            value={t(stats.kills)}
            color={color("kills")}
          />
          <Table.td
            title={t("stats.deaths")}
            value={t(stats.deaths)}
            color={color("deaths")}
          />
          <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color={color("kdr")} />
        </Table.tr>
        <Table.tr>
          <Table.td
            title={t("stats.bedsBroken")}
            value={t(stats.bedsBroken)}
            color={color("bedsBroken")}
          />
          <Table.td
            title={t("stats.bedsLost")}
            value={t(stats.bedsLost)}
            color={color("bedsLost")}
          />
          <Table.td title={t("stats.bblr")} value={t(stats.bblr)} color={color("bblr")} />
        </Table.tr>
        <Historical.progression
          time={time}
          progression={bedwars.progression}
          current={bedwars.levelFormatted}
          next={bedwars.nextLevelFormatted}
          t={t}
          level={bedwars.level}
          exp={bedwars.exp}
        />
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};

