/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, Historical, SidebarItem, Table, formatProgression } from "#components";
import { FormattedGame, type GameMode, type TNTGamesModes } from "@statsify/schemas";
import { formatTime, prettify } from "@statsify/util";
import type { BaseProfileProps } from "#commands/base.hypixel-command";

export interface TNTGamesProfileProps extends BaseProfileProps {
  mode: GameMode<TNTGamesModes>;
}

export const TNTGamesProfile = ({
  player,
  background,
  logo,
  skin,
  t,
  badge,
  user,
  mode,
  time,
}: TNTGamesProfileProps) => {
  const { tntgames } = player.stats;

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(tntgames.coins), "§6"],
    [t("stats.overallWins"), t(tntgames.wins), "§e"],
  ];

  let table;

  switch (mode.api) {
    case "tntRun":
      table = (
        <>
          <Table.tr>
            <Table.td title={t("stats.wins")} value={t(tntgames.tntRun.wins)} color="§a" />
            <Table.td title={t("stats.losses")} value={t(tntgames.tntRun.losses)} color="§c" />
            <Table.td title={t("stats.wlr")} value={t(tntgames.tntRun.wlr)} color="§6" />
            <Historical.include time={time}>
              <Table.td title={t("stats.potionsSplashed")} value={t(tntgames.tntRun.potionsSplashed)} color="§5" />
              <Table.td title={t("stats.blocksRan")} value={t(tntgames.tntRun.blocksRan)} color="§5" />
            </Historical.include>
          </Table.tr>
          <Historical.exclude time={time}>
            <Table.tr>
              <Table.td title={t("stats.potionsSplashed")} value={t(tntgames.tntRun.potionsSplashed)} color="§5" />
              <Table.td title={t("stats.blocksRan")} value={t(tntgames.tntRun.blocksRan)} color="§9" />
              <Table.td title={t("stats.bestTime")} value={formatTime(tntgames.tntRun.record)} color="§e" />
            </Table.tr>
          </Historical.exclude>
        </>
      );
      break;
    case "pvpRun":
      table = (
        <>
          <Table.tr>
            <Table.td title={t("stats.kills")} value={t(tntgames.pvpRun.kills)} color="§a" />
            <Table.td title={t("stats.deaths")} value={t(tntgames.pvpRun.deaths)} color="§c" />
            <Table.td title={t("stats.kdr")} value={t(tntgames.pvpRun.kdr)} color="§6" />
            <Historical.include time={time}>
              <Table.td title={t("stats.wins")} value={t(tntgames.pvpRun.wins)} color="§e" />
            </Historical.include>
          </Table.tr>
          <Historical.exclude time={time}>
            <Table.tr>
              <Table.td title={t("stats.wins")} value={t(tntgames.pvpRun.wins)} color="§a" />
              <Table.td title={t("stats.bestTime")} value={formatTime(tntgames.pvpRun.record)} color="§e" />
            </Table.tr>
          </Historical.exclude>
        </>
      );
      break;
    case "bowSpleef":
      table = (
        <Table.tr>
          <Table.td title={t("stats.wins")} value={t(tntgames.bowSpleef.wins)} color="§a" />
          <Table.td title={t("stats.losses")} value={t(tntgames.bowSpleef.losses)} color="§c" />
          <Table.td title={t("stats.wlr")} value={t(tntgames.bowSpleef.wlr)} color="§6" />
          <Table.td title={t("stats.shotsFired")} value={t(tntgames.bowSpleef.hits)} color="§e" />
        </Table.tr>
      );
      break;

    case "tntTag":
      table = (
        <>
          <Table.tr>
            <Table.td title={t("stats.kills")} value={t(tntgames.tntTag.kills)} color="§a" />
            <Table.td title={t("stats.deaths")} value={t(tntgames.tntTag.deaths)} color="§c" />
            <Table.td title={t("stats.kdr")} value={t(tntgames.tntTag.kdr)} color="§6" />
          </Table.tr>
          <Table.tr>
            <Table.td title={t("stats.wins")} value={t(tntgames.tntTag.wins)} color="§a" />
            <Table.td title={t("stats.tags")} value={t(tntgames.tntTag.tags)} color="§e" />
            <Table.td title={t("stats.powerups")} value={t(tntgames.tntTag.powerups)} color="§b" />
          </Table.tr>
        </>
      );
      break;
    case "wizards":
      switch (mode.submode.api) {
        case "overall":
          sidebar.push([t("stats.class"), prettify(tntgames.wizards.class), "§a"]);
          table = (
            <>
              <Table.tr>
                <Table.td title={t("stats.kills")} value={t(tntgames.wizards.kills)} color="§a" />
                <Table.td title={t("stats.deaths")} value={t(tntgames.wizards.deaths)} color="§c" />
                <Table.td title={t("stats.kdr")} value={t(tntgames.wizards.kdr)} color="§6" />
                <Table.td title={t("stats.assists")} value={t(tntgames.wizards.assists)} color="§e" />
              </Table.tr>
              <Table.tr>
                <Table.td title={t("stats.wins")} value={t(tntgames.wizards.wins)} color="§a" />
                <Table.td title={t("stats.points")} value={t(tntgames.wizards.points)} color="§e" />
                <Table.td title={t("stats.airTime")} value={formatTime(tntgames.wizards.airTime)} color="§b" />
                <Table.td title={t("stats.powerOrbs")} value={t(tntgames.wizards.powerOrbs)} color="§b" />
              </Table.tr>
            </>
          );
          break;
        default: {
          const stats = tntgames.wizards[mode.submode.api];

          table = (
            <Table.tr>
              <Table.td title={t("stats.kills")} value={t(stats.kills)} color="§a" />
              <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color="§c" />
              <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color="§6" />
              <Table.td title={t("stats.assists")} value={t(stats.assists)} color="§e" />
            </Table.tr>
          );
          break;
        }
      }
      break;
  }

  return (
    <Container background={background}>
      <Header
        skin={skin}
        name={player.prefixName}
        badge={badge}
        sidebar={sidebar}
        title={`§l${FormattedGame.TNT_GAMES} §fStats §r(${mode.formatted}${mode.submode ? ` ${mode.submode.formatted}` : ""})`}
        description={`§7${t("stats.prefix")}: ${
          tntgames[mode.api].naturalPrefix
        }\n${formatProgression({
          t,
          label: t("stats.progression.win"),
          progression: tntgames[mode.api].progression,
          currentLevel: tntgames[mode.api].currentPrefix,
          nextLevel: tntgames[mode.api].nextPrefix,
        })}`}
        time={time}
      />
      <Table.table>
        {table}
      </Table.table>
      <Footer logo={logo} user={user} />
    </Container>
  );
};
