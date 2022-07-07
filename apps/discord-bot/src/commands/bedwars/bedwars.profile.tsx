/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BaseProfileProps } from "../base.hypixel-command";
import { BedWarsModes, FormattedGame, GameMode } from "@statsify/schemas";
import {
  Container,
  Footer,
  Header,
  HistoricalProgression,
  SidebarItem,
  Table,
  formatProgression,
} from "#components";
import { arrayGroup, prettify } from "@statsify/util";

export interface BedWarsProfileProps extends BaseProfileProps {
  mode: GameMode<BedWarsModes>;
}

export const BedWarsProfile = ({
  skin,
  player,
  background,
  logo,
  tier,
  badge,
  mode,
  t,
  time,
}: BedWarsProfileProps) => {
  const { bedwars } = player.stats;
  const stats = bedwars[mode.api];

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(bedwars.coins), "§6"],
    [t("stats.lootChests"), t(bedwars.lootChests), "§e"],
    [t("stats.iron"), t(stats.itemsCollected.iron), "§7"],
    [t("stats.gold"), t(stats.itemsCollected.gold), "§6"],
    [t("stats.diamonds"), t(stats.itemsCollected.diamond), "§b"],
    [t("stats.emeralds"), t(stats.itemsCollected.emerald), "§2"],
  ];

  if (stats.winstreak) sidebar.push([t("stats.winstreak"), t(stats.winstreak), "§a"]);

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.BEDWARS} §fStats §r(${mode.formatted})`}
        description={`${FormattedGame.BEDWARS} §7Level: ${
          bedwars.levelFormatted
        }\n${formatProgression(
          t,
          bedwars.progression,
          bedwars.levelFormatted,
          bedwars.nextLevelFormatted
        )}`}
        time={time}
      />
      <Table.table>
        <Table.tr>
          <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§a" />
          <Table.td title={t("stats.losses")} value={t(stats.losses)} color="§c" />
          <Table.td title={t("stats.wlr")} value={t(stats.wlr)} color="§6" />
        </Table.tr>
        <Table.tr>
          <Table.td
            title={t("stats.finalKills")}
            value={t(stats.finalKills)}
            color="§a"
          />
          <Table.td
            title={t("stats.finalDeaths")}
            value={t(stats.finalDeaths)}
            color="§c"
          />
          <Table.td title={t("stats.fkdr")} value={t(stats.fkdr)} color="§6" />
        </Table.tr>
        <Table.tr>
          <Table.td title={t("stats.kills")} value={t(stats.kills)} color="§a" />
          <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color="§c" />
          <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color="§6" />
        </Table.tr>
        <Table.tr>
          <Table.td
            title={t("stats.bedsBroken")}
            value={t(stats.bedsBroken)}
            color="§a"
          />
          <Table.td title={t("stats.bedsLost")} value={t(stats.bedsLost)} color="§c" />
          <Table.td title={t("stats.bblr")} value={t(stats.bblr)} color="§6" />
        </Table.tr>
        <HistoricalProgression
          time={time}
          progression={bedwars.progression}
          current={bedwars.levelFormatted}
          next={bedwars.nextLevelFormatted}
          t={t}
          level={bedwars.level}
          exp={bedwars.exp}
        />
      </Table.table>
      <Footer logo={logo} tier={tier} />
    </Container>
  );
};

export const BedWarsChallenges = ({
  skin,
  player,
  background,
  logo,
  tier,
  badge,
  t,
  time,
}: BaseProfileProps) => {
  const challenges = player.stats.bedwars.challenges;

  const sidebar: SidebarItem[] = [
    ["Total Completions", t(challenges.totalChallenges), "§6"],
    ["Unique Completions", t(challenges.uniqueChallenges), "§e"],
  ];

  const rows = arrayGroup(Object.entries(challenges).slice(2), 4);

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.BEDWARS} §fChallenges`}
        time={time}
      />
      <Table.table>
        {rows.map((row) => (
          <Table.tr>
            {row.map((challenge) => (
              // Hypixel doesn't localize the challenge names, so we dont't need to localize them
              <Table.td
                title={prettify(challenge[0])}
                value={t(challenge[1])}
                color={challenge[1] > 0 ? "§a" : "§c"}
              />
            ))}
          </Table.tr>
        ))}
      </Table.table>
      <Footer logo={logo} tier={tier} />
    </Container>
  );
};
