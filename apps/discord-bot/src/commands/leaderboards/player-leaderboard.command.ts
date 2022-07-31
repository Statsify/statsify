/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Container from "typedi";
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
  MEGAWALLS_MODES,
  MURDER_MYSTERY_MODES,
  PAINTBALL_MODES,
  PARKOUR_MODES,
  PIT_MODES,
  PlayerStats,
  QUAKE_MODES,
  SKYWARS_MODES,
  SMASH_HEROES_MODES,
  SPEED_UHC_MODES,
  TNT_GAMES_MODES,
  TURBO_KART_RACERS_MODES,
  UHC_MODES,
  VAMPIREZ_MODES,
  WALLS_MODES,
  WARLORDS_MODES,
  WOOLWARS_MODES,
} from "@statsify/schemas";
import { ApiService, Command, CommandContext, SubCommand } from "@statsify/discord";
import { BaseLeaderboardCommand } from "./base.leaderboard-command";
import { GamesWithBackgrounds, mapBackground } from "#constants";
import { GuildLeaderboardArgument } from "./guild-leaderboard.argument";
import { GuildLeaderboardSubCommand } from "./guild-leaderboard.subcommand";
import { PlayerLeaderboardArgument } from "./player-leaderboard.argument";
import { getBackground } from "@statsify/assets";

@Command({
  name: "leaderboard",
  description: (t) => t("commands.player-leaderboard"),
})
export class PlayerLeaderboardCommand extends BaseLeaderboardCommand {
  public constructor(private readonly apiService: ApiService) {
    super();
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-arcade"),
    args: [new PlayerLeaderboardArgument("arcade")],
  })
  public arcade(context: CommandContext) {
    return this.run(context, "arcade", ARCADE_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-arenabrawl"),
    args: [new PlayerLeaderboardArgument("arenabrawl")],
  })
  public arenabrawl(context: CommandContext) {
    return this.run(context, "arenabrawl", ARENA_BRAWL_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-bedwars"),
    args: [new PlayerLeaderboardArgument("bedwars")],
  })
  public bedwars(context: CommandContext) {
    return this.run(context, "bedwars", BEDWARS_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-blitzsg"),
    args: [new PlayerLeaderboardArgument("blitzsg")],
  })
  public blitzsg(context: CommandContext) {
    return this.run(context, "blitzsg", BLITZSG_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-buildbattle"),
    args: [new PlayerLeaderboardArgument("buildbattle")],
  })
  public buildbattle(context: CommandContext) {
    return this.run(context, "buildbattle", BUILD_BATTLE_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-copsandcrims"),
    args: [new PlayerLeaderboardArgument("copsandcrims")],
  })
  public copsandcrims(context: CommandContext) {
    return this.run(context, "copsandcrims", COPS_AND_CRIMS_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-duels"),
    args: [new PlayerLeaderboardArgument("duels")],
  })
  public duels(context: CommandContext) {
    return this.run(context, "duels", DUELS_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-general"),
    args: [new PlayerLeaderboardArgument("general")],
  })
  public general(context: CommandContext) {
    return this.run(context, "general", GENERAL_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-megawalls"),
    args: [new PlayerLeaderboardArgument("megawalls")],
  })
  public megawalls(context: CommandContext) {
    return this.run(context, "megawalls", MEGAWALLS_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-murdermystery"),
    args: [new PlayerLeaderboardArgument("murdermystery")],
  })
  public murdermystery(context: CommandContext) {
    return this.run(context, "murdermystery", MURDER_MYSTERY_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-paintball"),
    args: [new PlayerLeaderboardArgument("paintball")],
  })
  public paintball(context: CommandContext) {
    return this.run(context, "paintball", PAINTBALL_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-parkour"),
    args: [new PlayerLeaderboardArgument("parkour")],
  })
  public parkour(context: CommandContext) {
    return this.run(context, "parkour", PARKOUR_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-pit"),
    args: [new PlayerLeaderboardArgument("pit")],
  })
  public pit(context: CommandContext) {
    return this.run(context, "pit", PIT_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-quake"),
    args: [new PlayerLeaderboardArgument("quake")],
  })
  public quake(context: CommandContext) {
    return this.run(context, "quake", QUAKE_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-skywars"),
    args: [new PlayerLeaderboardArgument("skywars")],
  })
  public skywars(context: CommandContext) {
    return this.run(context, "skywars", SKYWARS_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-smashheroes"),
    args: [new PlayerLeaderboardArgument("smashheroes")],
  })
  public smashheroes(context: CommandContext) {
    return this.run(context, "smashheroes", SMASH_HEROES_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-speeduhc"),
    args: [new PlayerLeaderboardArgument("speeduhc")],
  })
  public speeduhc(context: CommandContext) {
    return this.run(context, "speeduhc", SPEED_UHC_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-tntgames"),
    args: [new PlayerLeaderboardArgument("tntgames")],
  })
  public tntgames(context: CommandContext) {
    return this.run(context, "tntgames", TNT_GAMES_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-turbokartracers"),
    args: [new PlayerLeaderboardArgument("turbokartracers")],
  })
  public turbokartracers(context: CommandContext) {
    return this.run(context, "turbokartracers", TURBO_KART_RACERS_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-uhc"),
    args: [new PlayerLeaderboardArgument("uhc")],
  })
  public uhc(context: CommandContext) {
    return this.run(context, "uhc", UHC_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-vampirez"),
    args: [new PlayerLeaderboardArgument("vampirez")],
  })
  public vampirez(context: CommandContext) {
    return this.run(context, "vampirez", VAMPIREZ_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-walls"),
    args: [new PlayerLeaderboardArgument("walls")],
  })
  public walls(context: CommandContext) {
    return this.run(context, "walls", WALLS_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-warlords"),
    args: [new PlayerLeaderboardArgument("warlords")],
  })
  public warlords(context: CommandContext) {
    return this.run(context, "warlords", WARLORDS_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-woolwars"),
    args: [new PlayerLeaderboardArgument("woolwars")],
  })
  public woolwars(context: CommandContext) {
    return this.run(context, "woolwars", WOOLWARS_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.guild-leaderboard"),
    args: [GuildLeaderboardArgument],
  })
  public async guild(context: CommandContext) {
    return Container.get(GuildLeaderboardSubCommand).leaderboard(context);
  }

  private async run<T extends GamesWithBackgrounds>(
    context: CommandContext,
    prefix: keyof PlayerStats,
    modes: GameModes<T>
  ) {
    const leaderboard = context.option<string>("leaderboard");

    const field = `stats.${prefix}.${leaderboard.replaceAll(" ", ".")}`;

    const background = await getBackground(
      ...mapBackground(modes, modes.getModes()[0].api)
    );

    return this.createLeaderboard({
      context,
      background,
      field,
      getLeaderboard: this.apiService.getPlayerLeaderboard.bind(this.apiService),
      type: "player",
      getLeaderboardDataIcon: (id) => this.apiService.getPlayerHead(id, 24),
    });
  }
}
