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
  paginate,
} from "@statsify/discord";
import {
  ClassMetadata,
  FormattedGame,
  GameCounts,
  GamePlayers,
  METADATA_KEY,
} from "@statsify/schemas";
import { STATUS_COLORS } from "@statsify/logger";
import { mapGame } from "#constants";
import { removeFormatting } from "@statsify/util";

const GAMECOUNT_GAME_IDS = Object.keys(
  Reflect.getMetadata(METADATA_KEY, GameCounts.prototype) as ClassMetadata
) as (keyof GameCounts)[];

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
  public constructor(private readonly apiService: ApiService) {}

  public async run(context: CommandContext) {
    const t = context.t();
    const gamecounts = await this.apiService.getGamecounts();
    const selectedGame = context.option<string | undefined>("mode", undefined);

    if (this.isGameCountGameId(selectedGame)) {
      return {
        embeds: [this.createGameCountsEmbed(selectedGame, gamecounts[selectedGame], true)],
      };
    }

    const gamecountEntries = Object.entries(gamecounts) as [keyof GameCounts, GamePlayers][];

    const subGameGenerators = gamecountEntries
      .filter(([, g]) => g.modes && Object.keys(g.modes).length > 1)
      .map(([id, game]) => ({
        label: removeFormatting(FormattedGame[id]),
        emoji: t(`emojis:games.${id}`),
        generator: () => this.createGameCountsEmbed(id, game),
      }));

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

    return paginate(context, pages);
  }

  private formatGameCount(name: string, count: string, emoji?: string) {
    return `\`•\` ${emoji ? `${emoji} ` : ""}**${name}**: \`${count || 0}\``;
  }

  private createGameCountsEmbed(
    id: keyof GameCounts,
    { players, modes }: GamePlayers,
    showTitleEmoji = false
  ) {
    const name = removeFormatting(FormattedGame[id]);
    const list = Object.entries(modes ?? {}).sort((a, b) => Number(b[1]) - Number(a[1]));

    return new EmbedBuilder()
      .title((t) => {
        const emoji = showTitleEmoji ? `${t(`emojis:games.${id}`)} ` : "";
        return `${emoji}${name} ${t("players")}`;
      })
      .color(STATUS_COLORS.info)
      .description((t) => {
        const modeCounts = list
          .map(([mode, players]) => this.formatGameCount(mapGame(id, mode), t(players)))
          .join("\n");

        return [this.formatGameCount(t("stats.total"), t(players)), modeCounts]
          .filter(Boolean)
          .join("\n\n");
      });
  }

  private isGameCountGameId(id?: string): id is keyof GameCounts {
    return GAMECOUNT_GAME_IDS.includes(id as keyof GameCounts);
  }
}
