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
} from "../components/index.js";
import {
  FormattedGame,
  type GameMode,
  MurderMysteryModes,
} from "@statsify/schemas";
import { MURDER_MYSTERY, cardColours } from "@statsify/catalog";
import { formatRecordTime } from "@statsify/util";
import type { BaseProfileProps } from "../types.js";

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
  const colour = cardColours(MURDER_MYSTERY, mode.api);

  const sidebar: SidebarItem[] = [
    [t("stats.tokens"), t(murdermystery.tokens), colour("tokens")],
    [t("stats.goldPickedUp"), t(murdermystery[mode.api].goldPickedUp), colour("goldPickedUp")],
    [t("stats.gamesPlayed"), t(murdermystery[mode.api].gamesPlayed), colour("gamesPlayed")],
  ];

  let table: JSX.Element;

  switch (mode.api) {
    case "overall": {
      const stats = murdermystery[mode.api];

      table = (
        <Table.table>
          <Table.tr>
            <Table.td
              title={t("stats.wins")}
              value={t(stats.wins)}
              color={colour("wins")}
            />
            <Table.td
              title={t("stats.murdererWins")}
              value={t(stats.murdererWins)}
              color={colour("murdererWins")}
            />
            <Table.td
              title={t("stats.detectiveWins")}
              value={t(stats.detectiveWins)}
              color={colour("detectiveWins")}
            />
            <Table.td
              title={t("stats.heroWins")}
              value={t(stats.heroWins)}
              color={colour("heroWins")}
            />
          </Table.tr>
          <Table.tr>
            <Table.td
              title={t("stats.kills")}
              value={t(stats.kills)}
              color={colour("kills")}
            />
            <Table.td
              title={t("stats.deaths")}
              value={t(stats.deaths)}
              color={colour("deaths")}
            />
            <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color={colour("kdr")} />
            <Table.td
              title={t("stats.killsAsMurderer")}
              value={t(stats.killsAsMurderer)}
              color={colour("killsAsMurderer")}
            />
          </Table.tr>
          <Table.tr>
            <Table.td
              title={t("stats.thrownKnifeKills")}
              value={t(stats.thrownKnifeKills)}
              color={colour("thrownKnifeKills")}
            />
            <Table.td
              title={t("stats.trapKills")}
              value={t(stats.trapKills)}
              color={colour("trapKills")}
            />
            <Table.td
              title={t("stats.heroKills")}
              value={t(stats.heroKills)}
              color={colour("heroKills")}
            />
            <Table.td
              title={t("stats.bowKills")}
              value={t(stats.bowKills)}
              color={colour("bowKills")}
            />
            <Table.td
              title={t("stats.suicides")}
              value={t(stats.suicides)}
              color={colour("suicides")}
            />
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
            <Table.td
              title={t("stats.wins")}
              value={t(stats.wins)}
              color={colour("wins")}
            />
            <Table.td
              title={t("stats.murdererWins")}
              value={t(stats.murdererWins)}
              color={colour("murdererWins")}
            />
            <Table.td
              title={t("stats.detectiveWins")}
              value={t(stats.detectiveWins)}
              color={colour("detectiveWins")}
            />
          </Table.tr>
          <Table.tr>
            <Table.td
              title={t("stats.kills")}
              value={t(stats.kills)}
              color={colour("kills")}
            />
            <Table.td
              title={t("stats.deaths")}
              value={t(stats.deaths)}
              color={colour("deaths")}
            />
            <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color={colour("kdr")} />
            <Table.td
              title={t("stats.killsAsMurderer")}
              value={t(stats.killsAsMurderer)}
              color={colour("killsAsMurderer")}
            />
          </Table.tr>
          <Table.tr>
            <Table.td
              title={t("stats.thrownKnifeKills")}
              value={t(stats.thrownKnifeKills)}
              color={colour("thrownKnifeKills")}
            />
            <Table.td
              title={t("stats.trapKills")}
              value={t(stats.trapKills)}
              color={colour("trapKills")}
            />
            <Table.td
              title={t("stats.heroKills")}
              value={t(stats.heroKills)}
              color={colour("heroKills")}
            />
            <Table.td
              title={t("stats.bowKills")}
              value={t(stats.bowKills)}
              color={colour("bowKills")}
            />
            <Table.td
              title={t("stats.suicides")}
              value={t(stats.suicides)}
              color={colour("suicides")}
            />
          </Table.tr>
          <Historical.exclude time={time}>
            <Table.tr>
              <Table.td
                title={t("stats.fastestMurdererWin")}
                value={formatRecordTime(stats.fastestMurdererWin)}
                color={colour("fastestMurdererWin")}
              />
              <Table.td
                title={t("stats.fastestDetectiveWin")}
                value={formatRecordTime(stats.fastestDetectiveWin)}
                color={colour("fastestDetectiveWin")}
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
            <Table.td
              title={t("stats.wins")}
              value={t(stats.wins)}
              color={colour("wins")}
            />
            <Table.td
              title={t("stats.kills")}
              value={t(stats.kills)}
              color={colour("kills")}
            />
            <Table.td
              title={t("stats.deaths")}
              value={t(stats.deaths)}
              color={colour("deaths")}
            />
            <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color={colour("kdr")} />
          </Table.tr>
          <Table.tr>
            <Table.td
              title={t("stats.thrownKnifeKills")}
              value={t(stats.thrownKnifeKills)}
              color={colour("thrownKnifeKills")}
            />
            <Table.td
              title={t("stats.trapKills")}
              value={t(stats.trapKills)}
              color={colour("trapKills")}
            />
            <Table.td
              title={t("stats.bowKills")}
              value={t(stats.bowKills)}
              color={colour("bowKills")}
            />
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
            <Table.td
              title={t("stats.wins")}
              value={t(stats.wins)}
              color={colour("wins")}
            />
            <Historical.exclude time={time}>
              <Table.td
                title={t("stats.lastAliveGames")}
                value={t(stats.lastAliveGames)}
                color={colour("lastAliveGames")}
              />
            </Historical.exclude>
          </Table.tr>
          <Table.tr>
            <Table.td
              title={t("stats.killsAsInfected")}
              value={t(stats.killsAsInfected)}
              color={colour("killsAsInfected")}
            />
            <Table.td
              title={t("stats.killsAsSurvivor")}
              value={t(stats.killsAsSurvivor)}
              color={colour("killsAsSurvivor")}
            />
          </Table.tr>
          <Table.tr>
            <Table.td
              title={t("stats.alphaWins")}
              value={t(stats.alphaWins)}
              color={colour("alphaWins")}
            />
            <Table.td
              title={t("stats.killsAsAlpha")}
              value={t(stats.killsAsAlpha)}
              color={colour("killsAsAlpha")}
            />
          </Table.tr>
        </Table.table>
      );

      break;
    }
  }

  const description = [
    `§7${t("stats.prefix")}: ${murdermystery.prefix}`,
    `§7${t("stats.knife")}: ${colour("knife.name")}${murdermystery.knife.name}`,
  ];

  if (murdermystery.knife.progression.percent >= 1 || murdermystery.knife.progression.max === undefined)
    description.push(`§7${t("stats.progression.exp")}: §l§dPRESTIGED`);
  else
    description.push(
      `§7${t("stats.progression.exp")}: ${knifePrestigeProgressBar(murdermystery.knife.progression.percent)} §e${t(murdermystery.knife.progression.current)}§7/§d${t(murdermystery.knife.progression.max)}`
    );

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.MURDER_MYSTERY} §fStats §r(${mode.formatted})`}
        description={description.join("\n")}
        time={time}
        historicalSidebar
      />
      {table}
      <Footer logo={logo} user={user} />
    </Container>
  );
};

const knifePrestigeProgressBar = (percentage: number) => {
  const max = 10;
  const count = Math.ceil(max * percentage);
  return `§a${"-".repeat(count)}§7${"-".repeat(max - count)}§r`;
};
