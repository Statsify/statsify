/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container, Footer, Header, If, List } from "#components";
import { LEADERBOARD_RATIOS } from "@statsify/schemas";
import { PostLeaderboardRankingsResponse } from "@statsify/api-client";
import { formatPosition } from "#lib/format-position";
import { games, removeGameDash } from "./games.js";
import type { BaseProfileProps } from "#commands/base.hypixel-command";

export type RankingsRow = PostLeaderboardRankingsResponse;

export type RankingsSortMode =
  | "rank"
  | "percentile"
  | "rarity"
  | "flex"
  | "balanced"
  | "value";

export type RankingsView = "list" | "best-per-game" | "summary";

export interface SummaryRow {
  gameKey: string;
  gameFormatted: string;
  bestRank: number;
  bestTopPercent: number;
  avgScore: number;
  topStat: string;
}

const shouldColor = (stats: string[], field: string) =>
  stats.some((s) => field.includes(s));

const formatStat = (stat: { field: string; name: string }, game?: string) => {
  const field = stat.field.toLowerCase();
  const name = game ? stat.name.replace(`${game} `, "") : stat.name;

  let color = "§7";

  const green = LEADERBOARD_RATIOS.map((r) => r[0].toLowerCase());
  const red = LEADERBOARD_RATIOS.map((r) => r[1].toLowerCase());
  const gold = [...LEADERBOARD_RATIOS.map((r) => r[2].toLowerCase()), "coins", "gold"];
  const yellow = ["assists", "gamesplayed", "lootchests"];
  const aqua = ["exp", "level", "diamond", "goals"];
  const darkGreen = ["emerald"];
  const pink = ["karma"];

  if (shouldColor(green, field)) color = "§a";
  else if (shouldColor(red, field)) color = "§c";
  else if (shouldColor(gold, field)) color = "§6";
  else if (shouldColor(yellow, field)) color = "§e";
  else if (shouldColor(aqua, field)) color = "§b";
  else if (shouldColor(darkGreen, field)) color = "§2";
  else if (shouldColor(pink, field)) color = "§d";

  return `§l${color}${name}`;
};

const formatTopPercent = (topPercent: number) =>
  `${(topPercent * 100).toFixed(topPercent < 0.001 ? 4 : 2)}%`;

const formatScore = (score: number) => score.toFixed(2);

const scoreLabelFor = (sortMode: RankingsSortMode): string => {
  switch (sortMode) {
    case "rank":
    case "percentile":
      return "Score";
    case "rarity":
      return "Rarity";
    case "flex":
      return "Flex";
    case "balanced":
      return "Balanced";
    case "value":
      return "Score";
  }
};

const scoreValueFor = (row: RankingsRow, sortMode: RankingsSortMode): number => {
  switch (sortMode) {
    case "rank":
    case "rarity":
      return row.rarityScore;
    case "percentile":
      return row.topPercent;
    case "flex":
      return row.flexScore;
    case "balanced":
      return row.balancedScore;
    case "value":
      return row.rarityScore;
  }
};

export interface RankingsProfileProps extends Omit<BaseProfileProps, "time"> {
  data: RankingsRow[] | SummaryRow[];
  view: RankingsView;
  sortMode: RankingsSortMode;
  game?: string;
}

export const RankingsProfile = ({
  background,
  logo,
  user,
  data,
  t,
  player,
  skin,
  game,
  badge,
  view,
  sortMode,
}: RankingsProfileProps) => {
  const formattedGame = game ? removeGameDash(game) : "All";

  const titleSuffix =
    view === "summary" ? " §7- §fSummary" :
    view === "best-per-game" ? " §7- §fBest Per Game" :
    sortMode !== "rank" ? ` §7- §f${scoreLabelFor(sortMode)}` :
    "";

  const headerTitle = `§l§bLeaderboard Positions §r(§l${formattedGame}§r)${titleSuffix}`;

  let titles: string[];
  let items: JSX.Element[];

  if (view === "summary") {
    const rows = data as SummaryRow[];
    titles = ["Game", "Best Pos", "Best Top %", "Avg Score", "Top Stat"];
    items = rows.map((d) => (
      <>
        <box width="100%">
          <text>§l{removeGameDash(d.gameFormatted)}</text>
        </box>
        <box width="100%">
          <text>{formatPosition(t, d.bestRank)}</text>
        </box>
        <box width="100%">
          <text>{formatTopPercent(d.bestTopPercent)}</text>
        </box>
        <box width="100%">
          <text>{formatScore(d.avgScore)}</text>
        </box>
        <box width="remaining" direction="column">
          <text align="left">{formatStat({ field: `stats.${d.gameKey}`, name: d.topStat }, d.gameFormatted)}</text>
        </box>
      </>
    ));
  } else {
    const rows = data as RankingsRow[];
    const showGameColumn = !game || view === "best-per-game";
    const showScoreColumn = sortMode !== "rank";

    titles = ["Statistic", "Pos", "Top %"];
    if (showScoreColumn) titles.push(scoreLabelFor(sortMode));
    titles.push("Value");
    if (showGameColumn) titles.unshift("Game");

    items = rows.map((d) => {
      const originGameKey = d.field.split(".")[1];
      const originGame = games.find((g) => g.key === originGameKey);
      const displayGame = originGame?.formatted ?? game;

      return (
        <>
          <If condition={showGameColumn && Boolean(originGame)}>
            <box width="100%">
              <text>§l{removeGameDash(originGame?.formatted as string)}</text>
            </box>
          </If>
          <box width="remaining" direction="column">
            <text align="left">{formatStat(d, displayGame)}</text>
          </box>
          <box width="100%">
            <text>{formatPosition(t, d.rank)}</text>
          </box>
          <box width="100%">
            <text>{formatTopPercent(d.topPercent)}</text>
          </box>
          <If condition={showScoreColumn}>
            <box width="100%">
              <text>{formatScore(scoreValueFor(d, sortMode))}</text>
            </box>
          </If>
          <box width="100%">
            <text>{typeof d.value === "string" ? d.value : t(d.value)}</text>
          </box>
        </>
      );
    });
  }

  const titleBoxes = titles.map((field) => (
    <box
      width={field === "Statistic" || field === "Top Stat" ? "remaining" : "100%"}
      border={{ topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 }}
    >
      <text>§l{field}</text>
    </box>
  ));

  return (
    <Container background={background}>
      <Header
        name={player.prefixName}
        skin={skin}
        time="LIVE"
        title={headerTitle}
        badge={badge}
      />
      <List items={[<>{titleBoxes}</>, ...items]} />
      <Footer
        logo={logo}
        user={user}
        border={{ bottomLeft: 4, bottomRight: 4, topLeft: 0, topRight: 0 }}
      />
    </Container>
  );
};
