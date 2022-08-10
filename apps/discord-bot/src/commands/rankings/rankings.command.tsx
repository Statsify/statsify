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
  COPS_AND_CRIMS_MODES,
  DUELS_MODES,
  GENERAL_MODES,
  GameModes,
  LeaderboardScanner,
  MEGAWALLS_MODES,
  MURDER_MYSTERY_MODES,
  PAINTBALL_MODES,
  PARKOUR_MODES,
  PIT_MODES,
  Player,
  PlayerStats,
  QUAKE_MODES,
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
  WOOLWARS_MODES,
} from "@statsify/schemas";
import {
  ApiService,
  ButtonBuilder,
  Choice,
  Command,
  CommandContext,
  ErrorMessage,
  PaginateService,
  PlayerArgument,
  SubCommand,
} from "@statsify/discord";
import { ButtonStyle } from "discord-api-types/v10";
import { GamesWithBackgrounds, mapBackground } from "#constants";
import { RankingsProfile } from "./rankings.profile";
import { SubCommandOptions } from "@statsify/discord/src/command/command.interface";
import { arrayGroup } from "@statsify/util";
import { games } from "./games";
import { getBackground, getLogo } from "@statsify/assets";
import { getTheme } from "#themes";
import { render } from "@statsify/rendering";

const fields = LeaderboardScanner.getLeaderboardFields(Player).map(([key]) => key);

const choices = games.map((g) => [g.name, g.key] as Choice);
choices.unshift(["All", "all"]);

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
  public constructor(
    private readonly apiService: ApiService,
    private readonly paginateService: PaginateService
  ) {}

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
    description: (t) => t("commands.rankings-woolwars"),
  })
  public woolwars(context: CommandContext) {
    return this.run(context, "woolwars", WOOLWARS_MODES);
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

    const filteredFields = isGameNotAll
      ? fields.filter((f) => f.startsWith(`stats.${game}`))
      : fields;

    const rankings = await this.apiService.getPlayerRankings(filteredFields, player.uuid);

    if (!rankings.length)
      throw new ErrorMessage(
        (t) => t("errors.noRankings.title"),
        (t) =>
          t("errors.noRankings.description", {
            displayName: this.apiService.emojiDisplayName(t, player.displayName),
          })
      );

    const [skin, badge, logo, background] = await Promise.all([
      this.apiService.getPlayerSkin(player.uuid),
      this.apiService.getUserBadge(player.uuid),
      getLogo(user),
      getBackground(...mapBackground(modes, modes.getApiModes()[0])),
    ]);

    const groups = arrayGroup(
      rankings.sort((a, b) => a.rank - b.rank),
      10
    );

    const formattedGame = isGameNotAll
      ? games.find((g) => g.key === game)?.formatted
      : undefined;

    return this.paginateService.scrollingPagination(
      context,
      groups.map(
        (group) => () =>
          render(
            <RankingsProfile
              background={background}
              data={group}
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
