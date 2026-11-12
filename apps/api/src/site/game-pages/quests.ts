/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FormattedGame, type GameId, type PlayerStats, Quests, questPeriodStart } from "@statsify/schemas";
import { QUESTS, QUEST_PERIODS, QUEST_TIMES, type QuestPeriod, modeName, modeStats, shapeKeys } from "@statsify/catalog";
import { type CellSpec, type GameLayout, type OverviewSpec, type PageSpec, read } from "./layout.js";

const GAMES = QUESTS.modes.getApiModes().filter((mode) => mode !== "overall") as GameId[];

/** How many quests a game has in a period: its stats there, less their total. */
const count = (period: QuestPeriod, game: GameId) => shapeKeys(QUESTS, `${period}.${game}`).filter((key) => key !== "total").length;

/** Monthly is offered on Overall and the games with a monthly quest (SkyWars alone), as on the bot. */
const MONTHLY = new Set<string>(["overall", ...GAMES.filter((game) => count("monthly", game) > 0)]);

/** When a period's counts began, for counts taken at `at` (ms): the schema's own start, at the fetch rather than now. */
const periodStart = (period: string, at: number) => questPeriodStart(QUEST_TIMES[period], at);

/** Total, then each period's, longest first (Monthly's added up from every game's, as the schema stores none). */
const OVERVIEW: OverviewSpec[] = [
  "total",
  {
    key: "monthlyTotal",
    label: "stats.monthlyTotal",
    color: "§b",
    compute: ({ quests }) => Quests.getTotal(quests.monthly),
  },
  "weeklyTotal",
  "dailyTotal",
];

/**
 * Overall: every game under its name and icon. All time, its total, most first, in the card's default white; in a
 * period, its quests done out of its count for the period, best share first, leaving out games with none.
 */
function overall(period: QuestPeriod): PageSpec {
  const allTime = period === "overall";
  const cells: CellSpec[] = GAMES.filter((game) => allTime || count(period, game) > 0).map((game) => ({
    key: "total",
    at: `${period}.${game}`,
    name: FormattedGame[game],
    icon: game,
    ...(allTime && { color: "§f" as const }),
  }));

  return { heading: { word: null, mode: "Overall" }, sections: [{ cells, sort: allTime ? "desc" : "share", list: true }] };
}

/**
 * A game: its total beside the overview, then its quests, most done first, each named green once done and red until
 * then. All time, each count is in white and links to its leaderboard; in a period, each is a tick or a cross.
 */
function game(id: GameId, period: QuestPeriod): PageSpec {
  const place = `${period}.${id}`;
  const allTime = period === "overall";
  const quests = modeStats(QUESTS, place).filter(({ key }) => key !== "total");
  const done = (stats: PlayerStats, key: string) => Number(read(stats, `quests.overall.${id}.${key}`)) > 0;

  return {
    place,
    heading: { word: null, mode: `§l${FormattedGame[id]}` },
    overview: [...OVERVIEW, { key: "total", at: place, label: "stats.game-total", params: { game: modeName(QUESTS, id) }, color: "§a" }],
    sections: [
      {
        cells: quests.map(({ key, name }): CellSpec =>
          allTime ? { key, color: "§f", name: (stats) => `${done(stats, key) ? "§a" : "§c"}${name}` } : key),
        sort: "desc",
        list: true,
        ...(!allTime && { ticks: true }),
      },
    ],
  };
}

/**
 * The bot's `/quests`: a page of its own, as the stats have their own root and a ranking of the games, with a period
 * switcher for its four subcommands (all time, daily, weekly, monthly).
 */
export const QUESTS_PAGE: GameLayout = {
  game: QUESTS,
  name: "§eQuests",
  overview: OVERVIEW,
  periods: (mode) => (MONTHLY.has(mode) ? QUEST_PERIODS : QUEST_PERIODS.filter((period) => period !== "monthly")),
  periodStart,
  page: (mode, _submode, period = "overall") =>
    mode === "overall" ? overall(period as QuestPeriod) : game(mode as GameId, period as QuestPeriod),
  played: ({ quests }) => quests.total > 0,
};
