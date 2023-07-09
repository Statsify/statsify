/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, Historical, SidebarItem, Table } from "#components";
import { FormattedGame, GameMode, MurderMysteryModes } from "@statsify/schemas";
import { formatTime } from "@statsify/util";
import type { BaseProfileProps } from "#commands/base.hypixel-command";

export interface MurderMysteryProfileProps extends BaseProfileProps {
  mode: GameMode<MurderMysteryModes>;
}

export const MurderMysteryProfile = ({
  player,
  background,
  logo,
  skin,
  t,
  badge,
  mode,
  user,
  time,
}: MurderMysteryProfileProps) => {
  const { murdermystery } = player.stats;

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(murdermystery.coins), "§6"],
    [t("stats.lootChests"), t(murdermystery.lootChests), "§e"],
    [t("stats.goldPickedUp"), t(murdermystery[mode.api].goldPickedUp), "§6"],
    [t("stats.gamesPlayed"), t(murdermystery[mode.api].gamesPlayed), "§b"],
  ];

  let table: JSX.Element;

  switch (mode.api) {
    case "overall": {
      const stats = murdermystery[mode.api];

      table = (
        <Table.table>
          <Table.tr>
            <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§a" />
            <Table.td
              title={t("stats.murdererWins")}
              value={t(stats.murdererWins)}
              color="§c"
            />
            <Table.td
              title={t("stats.detectiveWins")}
              value={t(stats.detectiveWins)}
              color="§b"
            />
            <Table.td title={t("stats.heroWins")} value={t(stats.heroWins)} color="§e" />
          </Table.tr>
          <Table.tr>
            <Table.td title={t("stats.kills")} value={t(stats.kills)} color="§a" />
            <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color="§c" />
            <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color="§6" />
            <Table.td
              title={t("stats.killsAsMurderer")}
              value={t(stats.killsAsMurderer)}
              color="§4"
            />
          </Table.tr>
          <Table.tr>
            <Table.td
              title={t("stats.thrownKnifeKills")}
              value={t(stats.thrownKnifeKills)}
              color="§a"
            />
            <Table.td
              title={t("stats.trapKills")}
              value={t(stats.trapKills)}
              color="§c"
            />
            <Table.td title={t("stats.bowKills")} value={t(stats.bowKills)} color="§6" />
            <Table.td title={t("stats.suicides")} value={t(stats.suicides)} color="§4" />
          </Table.tr>
        </Table.table>
      );

      break;
    }
    case "doubleUp":
    case "classic": {
      const stats = murdermystery[mode.api];

      table = (
        <Table.table>
          <Table.tr>
            <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§a" />
            <Table.td
              title={t("stats.murdererWins")}
              value={t(stats.murdererWins)}
              color="§c"
            />
            <Table.td
              title={t("stats.detectiveWins")}
              value={t(stats.detectiveWins)}
              color="§b"
            />
            <Table.td title={t("stats.heroWins")} value={t(stats.heroWins)} color="§e" />
          </Table.tr>
          <Table.tr>
            <Table.td title={t("stats.kills")} value={t(stats.kills)} color="§a" />
            <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color="§c" />
            <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color="§6" />
            <Table.td
              title={t("stats.killsAsMurderer")}
              value={t(stats.killsAsMurderer)}
              color="§4"
            />
          </Table.tr>
          <Table.tr>
            <Table.td
              title={t("stats.thrownKnifeKills")}
              value={t(stats.thrownKnifeKills)}
              color="§a"
            />
            <Table.td
              title={t("stats.trapKills")}
              value={t(stats.trapKills)}
              color="§c"
            />
            <Table.td title={t("stats.bowKills")} value={t(stats.bowKills)} color="§6" />
            <Table.td title={t("stats.suicides")} value={t(stats.suicides)} color="§4" />
          </Table.tr>
          <Historical.exclude time={time}>
            <Table.tr>
              <Table.td
                title={t("stats.fastestMurdererWin")}
                value={
                  stats.fastestMurdererWin ? formatTime(stats.fastestMurdererWin) : "N/A"
                }
                color="§c"
              />
              <Table.td
                title={t("stats.fastestDetectiveWin")}
                value={
                  stats.fastestDetectiveWin
                    ? formatTime(stats.fastestDetectiveWin)
                    : "N/A"
                }
                color="§b"
              />
            </Table.tr>
          </Historical.exclude>
        </Table.table>
      );

      break;
    }
    case "assassins": {
      const stats = murdermystery[mode.api];

      table = (
        <Table.table>
          <Table.tr>
            <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§e" />
            <Table.td title={t("stats.kills")} value={t(stats.kills)} color="§a" />
            <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color="§c" />
            <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color="§6" />
          </Table.tr>
          <Table.tr>
            <Table.td
              title={t("stats.thrownKnifeKills")}
              value={t(stats.thrownKnifeKills)}
              color="§a"
            />
            <Table.td
              title={t("stats.trapKills")}
              value={t(stats.trapKills)}
              color="§c"
            />
            <Table.td title={t("stats.bowKills")} value={t(stats.bowKills)} color="§6" />
          </Table.tr>
        </Table.table>
      );

      break;
    }
    case "infection": {
      const stats = murdermystery[mode.api];

      table = (
        <Table.table>
          <Table.tr>
            <Table.td title={t("stats.wins")} value={t(stats.wins)} color="§a" />
            <Table.td
              title={t("stats.survivorWins")}
              value={t(stats.survivorWins)}
              color="§e"
            />
          </Table.tr>
          <Table.tr>
            <Table.td
              title={t("stats.killsAsInfected")}
              value={t(stats.killsAsInfected)}
              color="§2"
            />
            <Table.td
              title={t("stats.killsAsSurvivor")}
              value={t(stats.killsAsSurvivor)}
              color="§6"
            />
          </Table.tr>
          <Historical.exclude time={time}>
            <Table.tr>
              <Table.td
                title={t("stats.lastAliveGames")}
                value={t(stats.lastAliveGames)}
                color="§b"
              />
            </Table.tr>
          </Historical.exclude>
        </Table.table>
      );

      break;
    }
  }

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.MURDER_MYSTERY} §fStats §r(${mode.formatted})`}
        time={time}
        historicalSidebar
      />
      {table}
      <Footer logo={logo} user={user} />
    </Container>
  );
};
