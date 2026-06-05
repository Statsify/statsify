/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  ARCADE_MODES,
  ARENA_BRAWL_MODES,
  BEDWARS_MODES,
  BLITZSG_MODES,
  BUILD_BATTLE_MODES,
  CHALLENGE_MODES,
  COPS_AND_CRIMS_MODES,
  DUELS_MODES,
  GENERAL_MODES,
  GameModes,
  MEGAWALLS_MODES,
  MURDER_MYSTERY_MODES,
  PAINTBALL_MODES,
  PARKOUR_MODES,
  PIT_MODES,
  Player,
  PlayerStats,
  QUAKE_MODES,
  QUEST_MODES,
  SKYWARS_MODES,
  SMASH_HEROES_MODES,
  SPEED_UHC_MODES,
  TNT_GAMES_MODES,
  TURBO_KART_RACERS_MODES,
  UHC_MODES,
  UserTier,
  VAMPIREZ_MODES,
  WALLS_MODES,
  WARLORDS_MODES,
  WOOLGAMES_MODES,
  getLeaderboardFields,
} from "@statsify/schemas";
import {
  ApiService,
  ButtonBuilder,
  Choice,
  ChoiceArgument,
  Command,
  CommandContext,
  ErrorMessage,
  scrollingPagination,
  PlayerArgument,
  SubCommand,
  type SubCommandOptions,
} from "@statsify/discord";
import { ButtonStyle } from "discord-api-types/v10";
import { type GamesWithBackgrounds, mapBackground } from "#constants";
import {
  RankingsProfile,
  type RankingsRow,
  type RankingsSortMode,
  type RankingsView,
  type SummaryRow,
} from "./rankings.profile.js";
import { arrayGroup } from "@statsify/util";
import { games } from "./games.js";
import { getBackground, getLogo } from "@statsify/assets";
import { getTheme } from "#themes";
import { render } from "@statsify/rendering";

const fields = getLeaderboardFields(Player).map(([key]) => key);

function getScoreFor(row: RankingsRow, sortMode: RankingsSortMode): number {
  switch (sortMode) {
    case "rank":
      return row.rank;
    case "percentile":
      return row.topPercent;
    case "rarity":
      return row.rarityScore;
    case "flex":
      return row.flexScore;
    case "balanced":
      return row.balancedScore;
    case "value":
      return row.rawValue;
  }
}

function isAscendingSort(sortMode: RankingsSortMode): boolean {
  return sortMode === "rank" || sortMode === "percentile";
}

function sortRankings(rows: RankingsRow[], sortMode: RankingsSortMode): RankingsRow[] {
  const factor = isAscendingSort(sortMode) ? 1 : -1;
  return [...rows].sort(
    (a, b) => factor * (getScoreFor(a, sortMode) - getScoreFor(b, sortMode))
  );
}

function pickBestPerGame(
  rows: RankingsRow[],
  sortMode: RankingsSortMode
): RankingsRow[] {
  const ascending = isAscendingSort(sortMode);
  const byGame = new Map<string, RankingsRow>();

  for (const row of rows) {
    const gameKey = row.field.split(".")[1];
    const current = byGame.get(gameKey);

    if (!current) {
      byGame.set(gameKey, row);
      continue;
    }

    const better = ascending ?
      getScoreFor(row, sortMode) < getScoreFor(current, sortMode) :
      getScoreFor(row, sortMode) > getScoreFor(current, sortMode);

    if (better) byGame.set(gameKey, row);
  }

  return sortRankings([...byGame.values()], sortMode);
}

function buildSummary(
  rows: RankingsRow[],
  sortMode: RankingsSortMode
): SummaryRow[] {
  // For rank-mode summary, raw rank average is misleading, so summarize by rarity instead.
  const aggregateMode: RankingsSortMode = sortMode === "rank" ? "rarity" : sortMode;
  const ascending = isAscendingSort(aggregateMode);
  const groups = new Map<string, RankingsRow[]>();

  for (const row of rows) {
    const gameKey = row.field.split(".")[1];
    if (!groups.has(gameKey)) groups.set(gameKey, []);
    groups.get(gameKey)!.push(row);
  }

  const summary: SummaryRow[] = [];

  for (const [gameKey, items] of groups) {
    const sorted = sortRankings(items, aggregateMode);
    const top = sorted.slice(0, 5);
    const sum = top.reduce((acc, r) => acc + getScoreFor(r, aggregateMode), 0);
    const avgScore = top.length > 0 ? sum / top.length : 0;
    const bestRow = sorted[0];
    const gameFormatted =
      games.find((g) => g.key === gameKey)?.formatted ?? gameKey;

    summary.push({
      gameKey,
      gameFormatted,
      bestRank: bestRow.rank,
      bestTopPercent: bestRow.topPercent,
      avgScore,
      topStat: bestRow.name,
    });
  }

  return summary.sort(
    (a, b) => (ascending ? 1 : -1) * (a.avgScore - b.avgScore)
  );
}

const choices = games.map((g) => [g.name, g.key] as Choice);
choices.unshift(["All", "all"]);

const sortChoices: Choice[] = [
  ["Rank", "rank"],
  ["Top %", "percentile"],
  ["Rarity", "rarity"],
  ["Flex", "flex"],
  ["Balanced", "balanced"],
  ["Value", "value"],
];

const viewChoices: Choice[] = [
  ["List", "list"],
  ["Best Per Game", "best-per-game"],
  ["Summary", "summary"],
];

const minChoices: Choice[] = [
  ["Top 10", "10"],
  ["Top 100", "100"],
  ["Top 1,000", "1000"],
  ["Top 10,000", "10000"],
];

const options: Partial<SubCommandOptions> = {
  args: [
    PlayerArgument,
    new ChoiceArgument({ name: "sort", required: false, choices: sortChoices }),
    new ChoiceArgument({ name: "view", required: false, choices: viewChoices }),
    new ChoiceArgument({ name: "min", required: false, choices: minChoices }),
  ],
  tier: UserTier.IRON,
  preview: "rankings.png",
};

@Command({
  description: (t) => t("commands.rankings"),
  tier: UserTier.IRON,
  preview: "rankings.png",
})
export class RankingsCommand {
  public constructor(private readonly apiService: ApiService) {}

  @SubCommand({
    ...options,
    description: (t) => t("commands.rankings-all"),
  })
  public all(context: CommandContext) {
    return this.run(context, "all", GENERAL_MODES);
  }

  @SubCommand({
    ...options,
    description: (t) => t("commands.rankings-arcade"),
  })
  public arcade(context: CommandContext) {
    return this.run(context, "arcade", ARCADE_MODES);
  }

  @SubCommand({
    ...options,
    description: (t) => t("commands.rankings-arenabrawl"),
    group: "classic",
  })
  public arenabrawl(context: CommandContext) {
    return this.run(context, "arenabrawl", ARENA_BRAWL_MODES);
  }

  @SubCommand({
    ...options,
    description: (t) => t("commands.rankings-bedwars"),
  })
  public bedwars(context: CommandContext) {
    return this.run(context, "bedwars", BEDWARS_MODES);
  }

  @SubCommand({
    ...options,
    description: (t) => t("commands.rankings-blitzsg"),
  })
  public blitzsg(context: CommandContext) {
    return this.run(context, "blitzsg", BLITZSG_MODES);
  }

  @SubCommand({
    ...options,
    description: (t) => t("commands.rankings-buildbattle"),
  })
  public buildbattle(context: CommandContext) {
    return this.run(context, "buildbattle", BUILD_BATTLE_MODES);
  }

  @SubCommand({
    ...options,
    description: (t) => t("commands.rankings-challenges"),
  })
  public challenges(context: CommandContext) {
    return this.run(context, "challenges", CHALLENGE_MODES);
  }

  @SubCommand({
    ...options,
    description: (t) => t("commands.rankings-copsandcrims"),
  })
  public copsandcrims(context: CommandContext) {
    return this.run(context, "copsandcrims", COPS_AND_CRIMS_MODES);
  }

  @SubCommand({
    ...options,
    description: (t) => t("commands.rankings-duels"),
  })
  public duels(context: CommandContext) {
    return this.run(context, "duels", DUELS_MODES);
  }

  @SubCommand({
    ...options,
    description: (t) => t("commands.rankings-general"),
  })
  public general(context: CommandContext) {
    return this.run(context, "general", GENERAL_MODES);
  }

  @SubCommand({
    ...options,
    description: (t) => t("commands.rankings-megawalls"),
  })
  public megawalls(context: CommandContext) {
    return this.run(context, "megawalls", MEGAWALLS_MODES);
  }

  @SubCommand({
    ...options,
    description: (t) => t("commands.rankings-murdermystery"),
  })
  public murdermystery(context: CommandContext) {
    return this.run(context, "murdermystery", MURDER_MYSTERY_MODES);
  }

  @SubCommand({
    ...options,
    description: (t) => t("commands.rankings-paintball"),
    group: "classic",
  })
  public paintball(context: CommandContext) {
    return this.run(context, "paintball", PAINTBALL_MODES);
  }

  @SubCommand({
    ...options,
    description: (t) => t("commands.rankings-parkour"),
  })
  public parkour(context: CommandContext) {
    return this.run(context, "parkour", PARKOUR_MODES);
  }

  @SubCommand({
    ...options,
    description: (t) => t("commands.rankings-pit"),
  })
  public pit(context: CommandContext) {
    return this.run(context, "pit", PIT_MODES);
  }

  @SubCommand({
    ...options,
    description: (t) => t("commands.rankings-quake"),
    group: "classic",
  })
  public quake(context: CommandContext) {
    return this.run(context, "quake", QUAKE_MODES);
  }

  @SubCommand({
    ...options,
    description: (t) => t("commands.rankings-quests"),
  })
  public quests(context: CommandContext) {
    return this.run(context, "quests", QUEST_MODES);
  }

  @SubCommand({
    ...options,
    description: (t) => t("commands.rankings-skywars"),
  })
  public skywars(context: CommandContext) {
    return this.run(context, "skywars", SKYWARS_MODES);
  }

  @SubCommand({
    ...options,
    description: (t) => t("commands.rankings-smashheroes"),
  })
  public smashheroes(context: CommandContext) {
    return this.run(context, "smashheroes", SMASH_HEROES_MODES);
  }

  @SubCommand({
    ...options,
    description: (t) => t("commands.rankings-speeduhc"),
  })
  public speeduhc(context: CommandContext) {
    return this.run(context, "speeduhc", SPEED_UHC_MODES);
  }

  @SubCommand({
    ...options,
    description: (t) => t("commands.rankings-tntgames"),
  })
  public tntgames(context: CommandContext) {
    return this.run(context, "tntgames", TNT_GAMES_MODES);
  }

  @SubCommand({
    ...options,
    description: (t) => t("commands.rankings-turbokartracers"),
    group: "classic",
  })
  public turbokartracers(context: CommandContext) {
    return this.run(context, "turbokartracers", TURBO_KART_RACERS_MODES);
  }

  @SubCommand({
    ...options,
    description: (t) => t("commands.rankings-uhc"),
  })
  public uhc(context: CommandContext) {
    return this.run(context, "uhc", UHC_MODES);
  }

  @SubCommand({
    ...options,
    description: (t) => t("commands.rankings-vampirez"),
    group: "classic",
  })
  public vampirez(context: CommandContext) {
    return this.run(context, "vampirez", VAMPIREZ_MODES);
  }

  @SubCommand({
    ...options,
    description: (t) => t("commands.rankings-walls"),
    group: "classic",
  })
  public walls(context: CommandContext) {
    return this.run(context, "walls", WALLS_MODES);
  }

  @SubCommand({
    ...options,
    description: (t) => t("commands.rankings-warlords"),
  })
  public warlords(context: CommandContext) {
    return this.run(context, "warlords", WARLORDS_MODES);
  }

  @SubCommand({
    ...options,
    description: (t) => t("commands.rankings-woolgames"),
  })
  public woolgames(context: CommandContext) {
    return this.run(context, "woolgames", WOOLGAMES_MODES);
  }

  private async run<T extends GamesWithBackgrounds>(
    context: CommandContext,
    game: keyof PlayerStats | "all",
    modes: GameModes<T>
  ) {
    const user = context.getUser();
    const t = context.t();

    const player = await this.apiService.getPlayer(context.option("player"), user);

    const sortMode = (context.option<RankingsSortMode | undefined>("sort") ?? "rank") as RankingsSortMode;
    const view = (context.option<RankingsView | undefined>("view") ?? "list") as RankingsView;
    const minOption = context.option<string | undefined>("min");
    const minRank = minOption ? Number(minOption) : undefined;

    const isGameNotAll = game !== "all";

    const filteredFields = isGameNotAll ?
      fields.filter((f) => f.startsWith(`stats.${game}`)) :
      fields;

    const rawRankings = await this.apiService.getPlayerRankings(filteredFields, player.uuid);

    const rankings = minRank !== undefined ?
      rawRankings.filter((r) => r.rank <= minRank) :
      rawRankings;

    if (rankings.length === 0)
      throw new ErrorMessage(
        (t) => t("errors.noRankings.title"),
        (t) =>
          t("errors.noRankings.description", {
            displayName: this.apiService.emojiDisplayName(t, player.displayName),
          })
      );

    const [skin, badge, logo, background] = await Promise.all([
      this.apiService.getPlayerSkin(player.uuid, user),
      this.apiService.getUserBadge(player.uuid),
      getLogo(user),
      getBackground(...mapBackground(modes, modes.getApiModes()[0])),
    ]);

    const sortedRankings = sortRankings(rankings as RankingsRow[], sortMode);

    const formattedGame = isGameNotAll ?
      games.find((g) => g.key === game)?.formatted :
      undefined;

    let listGroups: RankingsRow[][] = [];
    let summaryGroups: SummaryRow[][] = [];

    if (view === "summary") {
      const summaryRows = buildSummary(sortedRankings, sortMode);
      summaryGroups = arrayGroup(summaryRows, 10);
    } else if (view === "best-per-game") {
      const best = pickBestPerGame(sortedRankings, sortMode);
      listGroups = arrayGroup(best, 10);
    } else {
      listGroups = arrayGroup(sortedRankings, 10);
    }

    const pageCount = view === "summary" ? summaryGroups.length : listGroups.length;

    return scrollingPagination(
      context,
      Array.from({ length: pageCount }, (_, i) => () =>
        render(
          <RankingsProfile
            background={background}
            data={view === "summary" ? summaryGroups[i] : listGroups[i]}
            view={view}
            sortMode={sortMode}
            logo={logo}
            badge={badge}
            player={player}
            skin={skin}
            t={t}
            user={user}
            game={formattedGame}
          />,
          getTheme(user)
        )
      ),
      new ButtonBuilder().emoji(t("emojis:up")).style(ButtonStyle.Success),
      new ButtonBuilder().emoji(t("emojis:down")).style(ButtonStyle.Danger),
      true
    );
  }
}
