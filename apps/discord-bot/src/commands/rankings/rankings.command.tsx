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
import { arrayGroup } from "@statsify/util";
import { games } from "./games";
import { getBackground, getLogo } from "@statsify/assets";
import { getTheme } from "#themes";
import { render } from "@statsify/rendering";

const fields = LeaderboardScanner.getLeaderboardFields(Player);

const choices = games.map((g) => [g.name, g.key] as Choice);
choices.unshift(["All", "all"]);

const args = [PlayerArgument];

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
    description: (t) => t("commands.rankings-all"),
    args,
    tier: UserTier.IRON,
    preview: "rankings.png",
  })
  public all(context: CommandContext) {
    return this.run(context, "all", GENERAL_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.rankings-arcade"),
    args,
    tier: UserTier.IRON,
    preview: "rankings.png",
  })
  public arcade(context: CommandContext) {
    return this.run(context, "arcade", ARCADE_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.rankings-arenabrawl"),
    args,
    tier: UserTier.IRON,
    preview: "rankings.png",
  })
  public arenabrawl(context: CommandContext) {
    return this.run(context, "arenabrawl", ARENA_BRAWL_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.rankings-bedwars"),
    args,
    tier: UserTier.IRON,
    preview: "rankings.png",
  })
  public bedwars(context: CommandContext) {
    return this.run(context, "bedwars", BEDWARS_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.rankings-blitzsg"),
    args,
    tier: UserTier.IRON,
    preview: "rankings.png",
  })
  public blitzsg(context: CommandContext) {
    return this.run(context, "blitzsg", BLITZSG_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.rankings-buildbattle"),
    args,
    tier: UserTier.IRON,
    preview: "rankings.png",
  })
  public buildbattle(context: CommandContext) {
    return this.run(context, "buildbattle", BUILD_BATTLE_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.rankings-copsandcrims"),
    args,
    tier: UserTier.IRON,
    preview: "rankings.png",
  })
  public copsandcrims(context: CommandContext) {
    return this.run(context, "copsandcrims", COPS_AND_CRIMS_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.rankings-duels"),
    args,
    tier: UserTier.IRON,
    preview: "rankings.png",
  })
  public duels(context: CommandContext) {
    return this.run(context, "duels", DUELS_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.rankings-events"),
    args,
    tier: UserTier.IRON,
    preview: "rankings.png",
  })
  public events(context: CommandContext) {
    return this.run(context, "events", GENERAL_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.rankings-general"),
    args,
    tier: UserTier.IRON,
    preview: "rankings.png",
  })
  public general(context: CommandContext) {
    return this.run(context, "general", GENERAL_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.rankings-megawalls"),
    args,
    tier: UserTier.IRON,
    preview: "rankings.png",
  })
  public megawalls(context: CommandContext) {
    return this.run(context, "megawalls", MEGAWALLS_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.rankings-murdermystery"),
    args,
    tier: UserTier.IRON,
    preview: "rankings.png",
  })
  public murdermystery(context: CommandContext) {
    return this.run(context, "murdermystery", MURDER_MYSTERY_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.rankings-paintball"),
    args,
    tier: UserTier.IRON,
    preview: "rankings.png",
  })
  public paintball(context: CommandContext) {
    return this.run(context, "paintball", PAINTBALL_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.rankings-parkour"),
    args,
    tier: UserTier.IRON,
    preview: "rankings.png",
  })
  public parkour(context: CommandContext) {
    return this.run(context, "parkour", PARKOUR_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.rankings-pit"),
    args,
    tier: UserTier.IRON,
  })
  public pit(context: CommandContext) {
    return this.run(context, "pit", PIT_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.rankings-quake"),
    args,
    tier: UserTier.IRON,
    preview: "rankings.png",
  })
  public quake(context: CommandContext) {
    return this.run(context, "quake", QUAKE_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.rankings-skywars"),
    args,
    tier: UserTier.IRON,
    preview: "rankings.png",
  })
  public skywars(context: CommandContext) {
    return this.run(context, "skywars", SKYWARS_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.rankings-smashheroes"),
    args,
    tier: UserTier.IRON,
    preview: "rankings.png",
  })
  public smashheroes(context: CommandContext) {
    return this.run(context, "smashheroes", SMASH_HEROES_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.rankings-speeduhc"),
    args,
    tier: UserTier.IRON,
    preview: "rankings.png",
  })
  public speeduhc(context: CommandContext) {
    return this.run(context, "speeduhc", SPEED_UHC_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.rankings-tntgames"),
    args,
    tier: UserTier.IRON,
    preview: "rankings.png",
  })
  public tntgames(context: CommandContext) {
    return this.run(context, "tntgames", TNT_GAMES_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.rankings-turbokartracers"),
    args,
    tier: UserTier.IRON,
    preview: "rankings.png",
  })
  public turbokartracers(context: CommandContext) {
    return this.run(context, "turbokartracers", TURBO_KART_RACERS_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.rankings-uhc"),
    args,
    tier: UserTier.IRON,
    preview: "rankings.png",
  })
  public uhc(context: CommandContext) {
    return this.run(context, "uhc", UHC_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.rankings-vampirez"),
    args,
    tier: UserTier.IRON,
    preview: "rankings.png",
  })
  public vampirez(context: CommandContext) {
    return this.run(context, "vampirez", VAMPIREZ_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.rankings-walls"),
    args,
    tier: UserTier.IRON,
    preview: "rankings.png",
  })
  public walls(context: CommandContext) {
    return this.run(context, "walls", WALLS_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.rankings-warlords"),
    args,
    tier: UserTier.IRON,
    preview: "rankings.png",
  })
  public warlords(context: CommandContext) {
    return this.run(context, "warlords", WARLORDS_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.rankings-woolwars"),
    args,
    tier: UserTier.IRON,
    preview: "rankings.png",
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
