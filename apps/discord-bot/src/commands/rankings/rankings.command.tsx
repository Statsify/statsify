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
  ActionRowBuilder,
  ApiService,
  ButtonBuilder,
  Command,
  CommandContext,
  ErrorMessage,
  Interaction,
  Message,
  PlayerArgument,
  SelectMenuBuilder,
  SelectMenuOptionBuilder,
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

const SORT_OPTIONS: Array<{ label: string; value: RankingsSortMode }> = [
  { label: "Rank", value: "rank" },
  { label: "Top %", value: "percentile" },
  { label: "Rarity", value: "rarity" },
  { label: "Flex", value: "flex" },
  { label: "Balanced", value: "balanced" },
  { label: "Value", value: "value" },
];

const VIEW_OPTIONS: Array<{ label: string; value: RankingsView }> = [
  { label: "List", value: "list" },
  { label: "Best Per Game", value: "best-per-game" },
  { label: "Summary", value: "summary" },
];

const MIN_OPTIONS: Array<{ label: string; value: string; rank: number }> = [
  { label: "No Filter", value: "0", rank: 0 },
  { label: "Top 10", value: "10", rank: 10 },
  { label: "Top 100", value: "100", rank: 100 },
  { label: "Top 1,000", value: "1000", rank: 1000 },
  { label: "Top 10,000", value: "10000", rank: 10_000 },
];

const PAGINATION_TIMEOUT_MS = 300_000;

const options: Partial<SubCommandOptions> = {
  args: [PlayerArgument],
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

    const isGameNotAll = game !== "all";

    const filteredFields = isGameNotAll ?
      fields.filter((f) => f.startsWith(`stats.${game}`)) :
      fields;

    const rawRankings = (await this.apiService.getPlayerRankings(
      filteredFields,
      player.uuid
    )) as RankingsRow[];

    if (rawRankings.length === 0)
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

    const formattedGame = isGameNotAll ?
      games.find((g) => g.key === game)?.formatted :
      undefined;

    let sortMode: RankingsSortMode = "rank";
    let view: RankingsView = "list";
    let minRank = 0;
    let pageIndex = 0;

    const sortMenu = new SelectMenuBuilder();
    for (const opt of SORT_OPTIONS) {
      sortMenu.option(new SelectMenuOptionBuilder().label(opt.label).value(opt.value));
    }
    sortMenu.activeOption(0);

    const viewMenu = new SelectMenuBuilder();
    for (const opt of VIEW_OPTIONS) {
      viewMenu.option(new SelectMenuOptionBuilder().label(opt.label).value(opt.value));
    }
    viewMenu.activeOption(0);

    const minMenu = new SelectMenuBuilder();
    for (const opt of MIN_OPTIONS) {
      minMenu.option(new SelectMenuOptionBuilder().label(opt.label).value(opt.value));
    }
    minMenu.activeOption(0);

    const prevButton = new ButtonBuilder()
      .emoji(t("emojis:up"))
      .style(ButtonStyle.Success);
    const nextButton = new ButtonBuilder()
      .emoji(t("emojis:down"))
      .style(ButtonStyle.Danger);

    const renderCache = new Map<string, Buffer>();

    function computePages() {
      let rows: RankingsRow[] = rawRankings;
      if (minRank > 0) rows = rows.filter((r) => r.rank <= minRank);

      const sorted = sortRankings(rows, sortMode);

      if (view === "summary") {
        return {
          pages: arrayGroup(buildSummary(sorted, sortMode), 10) as
            (RankingsRow[] | SummaryRow[])[],
        };
      }
      if (view === "best-per-game") {
        return {
          pages: arrayGroup(pickBestPerGame(sorted, sortMode), 10) as
            (RankingsRow[] | SummaryRow[])[],
        };
      }
      return {
        pages: arrayGroup(sorted, 10) as (RankingsRow[] | SummaryRow[])[],
      };
    }

    const buildMessage = async (): Promise<Message> => {
      const { pages } = computePages();
      const totalPages = pages.length;

      if (totalPages === 0) pageIndex = 0;
      else if (pageIndex >= totalPages) pageIndex = totalPages - 1;
      else if (pageIndex < 0) pageIndex = 0;

      const pageData = pages[pageIndex] ?? [];
      const cacheKey = `${sortMode}|${view}|${minRank}|${pageIndex}`;

      let pngBuffer = renderCache.get(cacheKey);
      if (!pngBuffer) {
        const canvas = render(
          <RankingsProfile
            background={background}
            data={pageData}
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
        );
        pngBuffer = await canvas.toBuffer("png");
        renderCache.set(cacheKey, pngBuffer);
      }

      prevButton.disable(totalPages <= 1);
      nextButton.disable(totalPages <= 1);

      return new Message({
        files: [{ name: "image.png", data: pngBuffer, type: "image/png" }],
        attachments: [],
        components: [
          new ActionRowBuilder([sortMenu]),
          new ActionRowBuilder([viewMenu]),
          new ActionRowBuilder([minMenu]),
          new ActionRowBuilder([prevButton, nextButton]),
        ],
      });
    };

    const userId = context.getInteraction().getUserId();
    const listener = context.getListener();

    const handleInteraction = async (
      interaction: Interaction,
      mutate: () => void
    ) => {
      interaction.setLocale(t.locale);

      if (interaction.getUserId() !== userId) {
        const message = await buildMessage();
        return interaction.sendFollowup({
          ...message,
          components: [],
          ephemeral: true,
        });
      }

      mutate();
      const message = await buildMessage();
      return context.reply(message);
    };

    listener.addHook(sortMenu.getCustomId(), (interaction) =>
      handleInteraction(interaction, () => {
        const selected = interaction.getData().values[0] as RankingsSortMode;
        const idx = SORT_OPTIONS.findIndex((o) => o.value === selected);
        if (idx >= 0 && SORT_OPTIONS[idx].value !== sortMode) {
          sortMode = SORT_OPTIONS[idx].value;
          sortMenu.activeOption(idx);
          pageIndex = 0;
        }
      })
    );

    listener.addHook(viewMenu.getCustomId(), (interaction) =>
      handleInteraction(interaction, () => {
        const selected = interaction.getData().values[0] as RankingsView;
        const idx = VIEW_OPTIONS.findIndex((o) => o.value === selected);
        if (idx >= 0 && VIEW_OPTIONS[idx].value !== view) {
          view = VIEW_OPTIONS[idx].value;
          viewMenu.activeOption(idx);
          pageIndex = 0;
        }
      })
    );

    listener.addHook(minMenu.getCustomId(), (interaction) =>
      handleInteraction(interaction, () => {
        const selected = interaction.getData().values[0];
        const idx = MIN_OPTIONS.findIndex((o) => o.value === selected);
        if (idx >= 0 && MIN_OPTIONS[idx].rank !== minRank) {
          minRank = MIN_OPTIONS[idx].rank;
          minMenu.activeOption(idx);
          pageIndex = 0;
        }
      })
    );

    listener.addHook(prevButton.getCustomId(), (interaction) =>
      handleInteraction(interaction, () => {
        const { pages } = computePages();
        if (pages.length <= 1) return;
        pageIndex = pageIndex === 0 ? pages.length - 1 : pageIndex - 1;
      })
    );

    listener.addHook(nextButton.getCustomId(), (interaction) =>
      handleInteraction(interaction, () => {
        const { pages } = computePages();
        if (pages.length <= 1) return;
        pageIndex = pageIndex === pages.length - 1 ? 0 : pageIndex + 1;
      })
    );

    setTimeout(() => {
      listener.removeHook(sortMenu.getCustomId());
      listener.removeHook(viewMenu.getCustomId());
      listener.removeHook(minMenu.getCustomId());
      listener.removeHook(prevButton.getCustomId());
      listener.removeHook(nextButton.getCustomId());
      renderCache.clear();
      context.reply({ components: [] });
    }, PAGINATION_TIMEOUT_MS);

    return buildMessage();
  }
}
