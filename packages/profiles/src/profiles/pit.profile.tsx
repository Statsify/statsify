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
import { PIT, cardColours } from "@statsify/catalog";
import { formatTime } from "@statsify/util";
import type { BaseProfileProps } from "../types.js";

export const PitProfile = ({
  background,
  logo,
  skin,
  t,
  badge,
  user,
  player,
  time,
}: BaseProfileProps) => {
  const { pit } = player.stats;
  const colour = cardColours(PIT);

  const sidebar: SidebarItem[] = [
    [t("stats.gold"), t(pit.gold), colour("gold")],
    [t("stats.goldEarned"), t(pit.goldEarned), colour("goldEarned")],
    [t("stats.contracts"), t(pit.contractsCompleted), colour("contractsCompleted")],
    [t("stats.renown"), t(pit.renown), colour("renown")],
    [t("stats.lifetimeRenown"), t(pit.lifetimeRenown), colour("lifetimeRenown")],
    [t("stats.bounty"), t(pit.bounty), colour("bounty")],
    [t("stats.blocksPlaced"), t(pit.blocksPlaced), colour("blocksPlaced")],
  ];

  return (
    <Container background={background}>
      <Header
        name={player.prefixName}
        skin={skin}
        time={time}
        title={`§l${FormattedGame.PIT} §fStats`}
        description={`§7${t("stats.level")}: ${pit.levelFormatted}\n${formatProgression({
          t,
          label: t("stats.progression.exp"),
          progression: pit.progression,
          currentLevel: pit.levelFormatted,
          nextLevel: pit.nextLevelFormatted,
          showLevel: true,
        })}`}
        sidebar={sidebar}
        badge={badge}
      />
      <Table.table>
        <Table.tr>
          <Table.td title={t("stats.kills")} value={t(pit.kills)} color={colour("kills")} />
          <Table.td title={t("stats.deaths")} value={t(pit.deaths)} color={colour("deaths")} />
          <Table.td title={t("stats.kdr")} value={t(pit.kdr)} color={colour("kdr")} />
        </Table.tr>
        <Table.tr>
          <Historical.exclude time={time}>
            <Table.td
              title={t("stats.highestStreak")}
              value={t(pit.highestStreak)}
              color={colour("highestStreak")}
            />
          </Historical.exclude>

          <Table.td
            title={t("stats.playtime")}
            value={formatTime(pit.playtime)}
            color={colour("playtime")}
          />
          <Table.td title={t("stats.assists")} value={t(pit.assists)} color={colour("assists")} />
        </Table.tr>
      </Table.table>
      <Historical.progression
        time={time}
        progression={pit.progression}
        current={pit.levelFormatted}
        next={pit.nextLevelFormatted}
        t={t}
        level={pit.trueLevel}
        exp={pit.exp}
      />
      <Footer logo={logo} user={user} />
    </Container>
  );
};
