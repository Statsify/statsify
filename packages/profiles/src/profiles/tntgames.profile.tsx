/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, Historical, SidebarItem, Table, formatProgression } from "../components/index.js";
import { FormattedGame, type GameMode, type TNTGamesModes } from "@statsify/schemas";
import { TNT_GAMES, cardColours } from "@statsify/catalog";
import { formatRecordTime, formatTime, prettify } from "@statsify/util";
import type { BaseProfileProps } from "../types.js";

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
  const colour = cardColours(TNT_GAMES);

  const sidebar: SidebarItem[] = [
    [t("stats.coins"), t(tntgames.coins), colour("coins")],
    [t("stats.overallWins"), t(tntgames.wins), colour("wins")],
  ];

  let table;

  switch (mode.api) {
    case "overall":

      table = (
        <Table.tr>
          <OverallColumn
            title="TNT Run"
            stats={
              time === "LIVE" ?
                [
                  [t("stats.wins"), t(tntgames.tntRun.wins)],
                  [t("stats.wlr"), t(tntgames.tntRun.wlr)],
                  [t("stats.bestTime"), formatRecordTime(tntgames.tntRun.record)],
                ] :
                [
                  [t("stats.wins"), t(tntgames.tntRun.wins)],
                  [t("stats.losses"), t(tntgames.tntRun.losses)],
                  [t("stats.wlr"), t(tntgames.tntRun.wlr)],
                ]
            }
          />
          <OverallColumn
            title="PVP Run"
            stats={[
              [t("stats.wins"), t(tntgames.pvpRun.wins)],
              [t("stats.kills"), t(tntgames.pvpRun.kills)],
              [t("stats.kdr"), t(tntgames.pvpRun.kdr)],
            ]}
          />
          <OverallColumn
            title="Bow Spleef"
            stats={[
              [t("stats.wins"), t(tntgames.bowSpleef.wins)],
              [t("stats.shotsFired"), t(tntgames.bowSpleef.hits)],
              [t("stats.wlr"), t(tntgames.bowSpleef.wlr)],
            ]}
          />
          <OverallColumn
            title="TNT Tag"
            stats={[
              [t("stats.wins"), t(tntgames.tntTag.wins)],
              [t("stats.kills"), t(tntgames.tntTag.kills)],
              [t("stats.tags"), t(tntgames.tntTag.tags)],
            ]}
          />
          <OverallColumn
            title="Wizards"
            stats={[
              [t("stats.wins"), t(tntgames.wizards.wins)],
              [t("stats.kills"), t(tntgames.wizards.kills)],
              [t("stats.kdr"), t(tntgames.wizards.kdr)],
            ]}
          />
        </Table.tr>
      );
      break;

    case "tntRun":
      table = (
        <>
          <Table.tr>
            <Table.td title={t("stats.wins")} value={t(tntgames.tntRun.wins)} color={colour("tntRun.wins")} />
            <Table.td title={t("stats.losses")} value={t(tntgames.tntRun.losses)} color={colour("tntRun.losses")} />
            <Table.td title={t("stats.wlr")} value={t(tntgames.tntRun.wlr)} color={colour("tntRun.wlr")} />
          </Table.tr>
          <Table.tr>
            <Table.td title={t("stats.potionsSplashed")} value={t(tntgames.tntRun.potionsSplashed)} color={colour("tntRun.potionsSplashed")} />
            <Table.td title={t("stats.blocksRan")} value={t(tntgames.tntRun.blocksRan)} color={colour("tntRun.blocksRan")} />
            <Historical.exclude time={time}>
              <Table.td title={t("stats.bestTime")} value={formatRecordTime(tntgames.tntRun.record)} color={colour("tntRun.record")} />
            </Historical.exclude>
          </Table.tr>
        </>
      );
      break;
    case "pvpRun":
      table = (
        <>
          <Table.tr>
            <Table.td title={t("stats.kills")} value={t(tntgames.pvpRun.kills)} color={colour("pvpRun.kills")} />
            <Table.td title={t("stats.deaths")} value={t(tntgames.pvpRun.deaths)} color={colour("pvpRun.deaths")} />
            <Table.td title={t("stats.kdr")} value={t(tntgames.pvpRun.kdr)} color={colour("pvpRun.kdr")} />
            <Historical.include time={time}>
              <Table.td
                title={t("stats.wins")}
                value={t(tntgames.pvpRun.wins)}
                // A session draws PVP Run's wins in its own colour; the catalog keeps the live card's.
                color="§e"
              />
            </Historical.include>
          </Table.tr>
          <Historical.exclude time={time}>
            <Table.tr>
              <Table.td title={t("stats.wins")} value={t(tntgames.pvpRun.wins)} color={colour("pvpRun.wins")} />
              <Table.td title={t("stats.bestTime")} value={formatRecordTime(tntgames.pvpRun.record)} color={colour("pvpRun.record")} />
            </Table.tr>
          </Historical.exclude>
        </>
      );
      break;
    case "bowSpleef":
      table = (
        <Table.tr>
          <Table.td title={t("stats.wins")} value={t(tntgames.bowSpleef.wins)} color={colour("bowSpleef.wins")} />
          <Table.td title={t("stats.losses")} value={t(tntgames.bowSpleef.losses)} color={colour("bowSpleef.losses")} />
          <Table.td title={t("stats.wlr")} value={t(tntgames.bowSpleef.wlr)} color={colour("bowSpleef.wlr")} />
          <Table.td title={t("stats.shotsFired")} value={t(tntgames.bowSpleef.hits)} color={colour("bowSpleef.hits")} />
        </Table.tr>
      );
      break;

    case "tntTag":
      sidebar.push([t("stats.powerups"), t(tntgames.tntTag.powerups), colour("tntTag.powerups")]);
      table = (
        <>
          <Table.tr>
            <Table.td title={t("stats.kills")} value={t(tntgames.tntTag.kills)} color={colour("tntTag.kills")} />
            <Table.td title={t("stats.deaths")} value={t(tntgames.tntTag.deaths)} color={colour("tntTag.deaths")} />
            <Table.td title={t("stats.kdr")} value={t(tntgames.tntTag.kdr)} color={colour("tntTag.kdr")} />
          </Table.tr>
          <Table.tr>
            <Table.td title={t("stats.wins")} value={t(tntgames.tntTag.wins)} color={colour("tntTag.wins")} />
            <Table.td title={t("stats.tags")} value={t(tntgames.tntTag.tags)} color={colour("tntTag.tags")} />
          </Table.tr>
        </>
      );
      break;
    case "wizards":
      switch (mode.submode.api) {
        case "overall":
          sidebar.push(
            [t("stats.class"), prettify(tntgames.wizards.class), colour("wizards.class")],
            [t("stats.powerOrbs"), t(tntgames.wizards.powerOrbs), colour("wizards.powerOrbs")]
          );

          table = (
            <>
              <Table.tr>
                <Table.td title={t("stats.kills")} value={t(tntgames.wizards.kills)} color={colour("wizards.kills")} />
                <Table.td title={t("stats.deaths")} value={t(tntgames.wizards.deaths)} color={colour("wizards.deaths")} />
                <Table.td title={t("stats.kdr")} value={t(tntgames.wizards.kdr)} color={colour("wizards.kdr")} />
                <Table.td title={t("stats.assists")} value={t(tntgames.wizards.assists)} color={colour("wizards.assists")} />
              </Table.tr>
              <Table.tr>
                <Table.td title={t("stats.wins")} value={t(tntgames.wizards.wins)} color={colour("wizards.wins")} />
                <Table.td title={t("stats.points")} value={t(tntgames.wizards.points)} color={colour("wizards.points")} />
                <Table.td title={t("stats.airTime")} value={formatTime(tntgames.wizards.airTime)} color={colour("wizards.airTime")} />
              </Table.tr>
            </>
          );
          break;
        default: {
          const stats = tntgames.wizards[mode.submode.api];
          const classColour = cardColours(TNT_GAMES, `wizards.${mode.submode.api}`);

          table = (
            <Table.tr>
              <Table.td title={t("stats.kills")} value={t(stats.kills)} color={classColour("kills")} />
              <Table.td title={t("stats.deaths")} value={t(stats.deaths)} color={classColour("deaths")} />
              <Table.td title={t("stats.kdr")} value={t(stats.kdr)} color={classColour("kdr")} />
              <Table.td title={t("stats.assists")} value={t(stats.assists)} color={classColour("assists")} />
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
        description={mode.api === "overall" ?
          undefined :
          `§7${t("stats.prefix")}: ${
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

interface OverallColumnProps {
  title: string;
  stats: [string, string][];
}

function OverallColumn({ title, stats }: OverallColumnProps) {
  const colors = ["§a", "§c", "§6"];

  return (
    <Table.ts title={`§6${title}`}>
      {stats.map(([title, value], index) => (
        <Table.td title={title} value={value} color={colors[index]} size="small" />
      ))}
    </Table.ts>
  );
}
