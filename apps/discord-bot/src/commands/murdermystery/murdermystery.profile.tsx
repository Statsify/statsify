/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { BaseProfileProps } from "../base.hypixel-command";
import { Container, Footer, Header, SidebarItem, Table } from "#components";
import { FormattedGame, MurderMysteryMode } from "@statsify/schemas";
import { LocalizeFunction } from "@statsify/discord";

interface MurderMysteryModeColumnProps {
  title: string;
  stats: MurderMysteryMode;
  t: LocalizeFunction;
}

const MurderMysteryModeColumn = ({ title, stats, t }: MurderMysteryModeColumnProps) => (
  <Table.ts title={`§6${title}`}>
    <Table.td title={t("stats.gamesPlayed")} value={t(stats.gamesPlayed)} color="§e" />
    <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§a" />
    <Table.td title={t("stats.kills")} value={t(stats.kills)} color="§c" />
    <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color="§b" />
  </Table.ts>
);

export const MurderMysteryProfile = ({
  player,
  background,
  logo,
  skin,
  t,
  badge,
  user,
  time,
}: BaseProfileProps) => {
  const { murdermystery } = player.stats;

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(murdermystery.coins), "§6"],
    [t("stats.lootChests"), t(murdermystery.lootChests), "§e"],
    [t("stats.murdererWins"), t(murdermystery.murdererWins), "§c"],
    [t("stats.detectiveWins"), t(murdermystery.detectiveWins), "§b"],
    [t("stats.heroWins"), t(murdermystery.heroWins), "§a"],
  ];

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.MURDER_MYSTERY} §fStats`}
        time={time}
        historicalSidebar
      />
      <Table.table>
        <Table.tr>
          <MurderMysteryModeColumn title="Overall" stats={murdermystery.overall} t={t} />
          <MurderMysteryModeColumn title="Classic" stats={murdermystery.classic} t={t} />
          <MurderMysteryModeColumn
            title="Double Up"
            stats={murdermystery.doubleUp}
            t={t}
          />
          <MurderMysteryModeColumn
            title="Assassins"
            stats={murdermystery.assassins}
            t={t}
          />
          <MurderMysteryModeColumn
            title="Infection"
            stats={murdermystery.infection}
            t={t}
          />
        </Table.tr>
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
