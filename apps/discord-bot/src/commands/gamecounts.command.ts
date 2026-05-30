/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  APIApplicationCommandOptionChoice,
  ApplicationCommandOptionType,
} from "discord-api-types/v10";
import {
  AbstractArgument,
  ApiService,
  Command,
  CommandContext,
  EmbedBuilder,
  LocalizationString,
  Page,
  PaginateService,
} from "@statsify/discord";
import { FormattedGame, GameId, GamePlayers } from "@statsify/schemas";
import { STATUS_COLORS } from "@statsify/logger";
import { mapGame } from "#constants";
import { removeFormatting } from "@statsify/util";

const GAMECOUNT_GAME_IDS = [
  "ARCADE",
  "ARENA_BRAWL",
  "BEDWARS",
  "BLITZSG",
  "BUILD_BATTLE",
  "COPS_AND_CRIMS",
  "DUELS",
  "HOUSING",
  "IDLE",
  "LIMBO",
  "MAIN_LOBBY",
  "MEGAWALLS",
  "MURDER_MYSTERY",
  "PAINTBALL",
  "PIT",
  "PROTOTYPE",
  "QUAKE",
  "QUEUE",
  "REPLAY",
  "SKYBLOCK",
  "SKYWARS",
  "SMASH_HEROES",
  "SMP",
  "SPEED_UHC",
  "TNT_GAMES",
  "TOURNAMENT_LOBBY",
  "TURBO_KART_RACERS",
  "UHC",
  "VAMPIREZ",
  "WALLS",
  "WARLORDS",
  "WOOLGAMES",
] as const satisfies readonly GameId[];

type GameCountGameId = (typeof GAMECOUNT_GAME_IDS)[number];

const GAMECOUNT_GAME_CHOICES = GAMECOUNT_GAME_IDS.map((id) => ({
  name: removeFormatting(FormattedGame[id]),
  value: id,
}));

class GameCountsModeArgument extends AbstractArgument {
  public name = "mode";
  public type = ApplicationCommandOptionType.String;
  public required = false;
  public autocomplete = true;
  public description: LocalizationString;

  public constructor() {
    super();
    this.description = (t) => t("stats.mode");
  }

  public autocompleteHandler(context: CommandContext): APIApplicationCommandOptionChoice[] {
    const currentValue = context.option<string>(this.name, "").toLowerCase();

    if (!currentValue) return GAMECOUNT_GAME_CHOICES.slice(0, 25);

    return GAMECOUNT_GAME_CHOICES
      .filter(({ name, value }) =>
        name.toLowerCase().includes(currentValue) ||
        value.toLowerCase().includes(currentValue)
      )
      .slice(0, 25);
  }
}

@Command({
  description: (t) => t("commands.game-counts"),
  args: [GameCountsModeArgument],
})
export class GameCountsCommand {
  public constructor(
    private readonly apiService: ApiService,
    private readonly paginateService: PaginateService
  ) {}

  public async run(context: CommandContext) {
    const t = context.t();
    const gamecounts = await this.apiService.getGamecounts();
    const selectedGame = context.option<string | undefined>("mode", undefined);

    const gamecountEntries = Object.entries(gamecounts) as [GameCountGameId, GamePlayers][];

    const subGameGenerators = gamecountEntries
      .filter(([, g]) => this.hasSubGames(g))
      .map(([id, game]) => this.createGameCountsPage(id, game));

    if (this.isGameCountGameId(selectedGame)) {
      return this.paginateService.paginate(context, [
        this.createGameCountsPage(selectedGame, gamecounts[selectedGame], true),
      ]);
    }

    const total = gamecountEntries.reduce((acc, [, v]) => acc + (v.players ?? 0), 0);

    const list = gamecountEntries
      .toSorted((a, b) => (b[1].players ?? 0) - (a[1].players ?? 0))
      .map(([id, { players }]) =>
        this.formatGameCount(
          removeFormatting(FormattedGame[id]),
          t(players),
          t(`emojis:games.${id}`)
        )
      )
      .join("\n");

    const overall = new EmbedBuilder()
      .title((t) => t("embeds.gameCounts.title"))
      .color(STATUS_COLORS.info)
      .description(
        (t) => `${this.formatGameCount(t("stats.total"), t(total))}\n\n${list}`
      );

    const pages: Page[] = [
      {
        label: "Overall",
        generator: () => overall,
      },
      ...subGameGenerators,
    ];

    return this.paginateService.paginate(context, pages);
  }

  private formatGameCount(name: string, count: string, emoji?: string) {
    return `\`•\` ${emoji ? `${emoji} ` : ""}**${name}**: \`${count || 0}\``;
  }

  private createGameCountsPage(
    id: GameId,
    { players, modes }: GamePlayers,
    showTitleEmoji = false
  ): Page {
    const name = removeFormatting(FormattedGame[id]);
    const list = Object.entries(modes ?? {}).sort((a, b) => Number(b[1]) - Number(a[1]));

    const embed = new EmbedBuilder()
      .title((t) => {
        const emoji = showTitleEmoji ? `${t(`emojis:games.${id}`)} ` : "";
        return `${emoji}${name} ${t("players")}`;
      })
      .color(STATUS_COLORS.info)
      .description(
        (t) => {
          const modeCounts = list
            .map(([mode, players]) => this.formatGameCount(mapGame(id, mode), t(players)))
            .join("\n");

          return [
            this.formatGameCount(t("stats.total"), t(players)),
            modeCounts,
          ].filter(Boolean).join("\n\n");
        }
      );

    return {
      label: name,
      emoji: (t) => t(`emojis:games.${id}`),
      generator: () => embed,
    };
  }

  private hasSubGames({ modes }: GamePlayers) {
    return modes && Object.keys(modes).length > 1;
  }

  private isGameCountGameId(id?: string): id is GameCountGameId {
    return GAMECOUNT_GAME_IDS.includes(id as GameCountGameId);
  }
}
