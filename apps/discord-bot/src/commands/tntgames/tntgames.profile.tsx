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
import { formatTime } from "@statsify/util";

interface TNTGamesModeColumnProps {
  title: string;
  stats: [string, string][];
}

const TNTGamesModeColumn = ({ title, stats }: TNTGamesModeColumnProps) => {
  const colors = ["§a", "§c", "§6"];

  return (
    <Table.ts title={`§6${title}`}>
      {stats.map(([title, value], index) => (
        <Table.td title={title} value={value} color={colors[index]} size="small" />
      ))}
    </Table.ts>
  );
};

export const TNTGamesProfile = ({
  player,
  background,
  logo,
  skin,
  t,
  badge,
  user,
  time,
}: BaseProfileProps) => {
  const { tntgames } = player.stats;

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(tntgames.coins), "§6"],
    [t("stats.wins"), t(tntgames.wins), "§e"],
    [t("stats.blocksRan"), t(tntgames.blocksRan), "§7"],
  ];

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.TNT_GAMES} §fStats`}
        time={time}
      />
      <Table.table>
        <Table.tr>
          <TNTGamesModeColumn
            title="PVP Run"
            stats={[
              [t("stats.wins"), t(tntgames.pvpRun.wins)],
              [t("stats.kills"), t(tntgames.pvpRun.kills)],
              [t("stats.wlr"), t(tntgames.pvpRun.wlr)],
            ]}
          />
          <TNTGamesModeColumn
            title="TNT Run"
            stats={
              time === "LIVE"
                ? [
                    [t("stats.wins"), t(tntgames.tntRun.wins)],
                    [t("stats.wlr"), t(tntgames.tntRun.wlr)],
                    [t("stats.bestTime"), formatTime(tntgames.tntRun.record)],
                  ]
                : [
                    [t("stats.wins"), t(tntgames.tntRun.wins)],
                    [t("stats.losses"), t(tntgames.tntRun.losses)],
                    [t("stats.wlr"), t(tntgames.tntRun.wlr)],
                  ]
            }
          />
          <TNTGamesModeColumn
            title="Wizards"
            stats={[
              [t("stats.wins"), t(tntgames.wizards.wins)],
              [t("stats.kills"), t(tntgames.wizards.kills)],
              [t("stats.kdr"), t(tntgames.wizards.kdr)],
            ]}
          />
          <TNTGamesModeColumn
            title="TNT Tag"
            stats={[
              [t("stats.wins"), t(tntgames.tntTag.wins)],
              [t("stats.kills"), t(tntgames.tntTag.kills)],
              [t("stats.tags"), t(tntgames.tntTag.tags)],
            ]}
          />
          <TNTGamesModeColumn
            title="Bow Spleef"
            stats={[
              [t("stats.wins"), t(tntgames.bowSpleef.wins)],
              [t("stats.hits"), t(tntgames.bowSpleef.hits)],
              [t("stats.wlr"), t(tntgames.bowSpleef.wlr)],
            ]}
          />
        </Table.tr>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
