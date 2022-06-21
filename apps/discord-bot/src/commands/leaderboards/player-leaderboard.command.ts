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
  MEGAWALLS_MODES,
  MURDER_MYSTERY_MODES,
  PAINTBALL_MODES,
  PARKOUR_MODES,
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
  WOOL_WARS_MODES,
} from "@statsify/schemas";
import { ApiService } from "#services";
import { BaseLeaderboardCommand } from "./base.leaderboard-command";
import { Command, CommandContext, SubCommand } from "@statsify/discord";
import { GamesWithBackgrounds, mapBackground } from "#constants";
import { PlayerLeaderboardArgument } from "#arguments";
import { getBackground } from "@statsify/assets";

@Command({ name: "leaderboard", description: (t) => t("commands.player-leaderboard") })
export class PlayerLeaderboardCommand extends BaseLeaderboardCommand {
  public constructor(private readonly apiService: ApiService) {
    super();
  }

  @SubCommand({
    description: (t) => t("commands.arcade"),
    args: [new PlayerLeaderboardArgument("arcade")],
  })
  public arcade(context: CommandContext) {
    return this.run(context, "arcade", ARCADE_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.arenabrawl"),
    args: [new PlayerLeaderboardArgument("arenabrawl")],
  })
  public arenabrawl(context: CommandContext) {
    return this.run(context, "arenabrawl", ARENA_BRAWL_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.bedwars"),
    args: [new PlayerLeaderboardArgument("bedwars")],
  })
  public bedwars(context: CommandContext) {
    return this.run(context, "bedwars", BEDWARS_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.blitzsg"),
    args: [new PlayerLeaderboardArgument("blitzsg")],
  })
  public blitzsg(context: CommandContext) {
    return this.run(context, "blitzsg", BLITZSG_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.buildbattle"),
    args: [new PlayerLeaderboardArgument("buildbattle")],
  })
  public buildbattle(context: CommandContext) {
    return this.run(context, "buildbattle", BUILD_BATTLE_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.copsandcrims"),
    args: [new PlayerLeaderboardArgument("copsandcrims")],
  })
  public copsandcrims(context: CommandContext) {
    return this.run(context, "copsandcrims", COPS_AND_CRIMS_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.duels"),
    args: [new PlayerLeaderboardArgument("duels")],
  })
  public duels(context: CommandContext) {
    return this.run(context, "duels", DUELS_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.general"),
    args: [new PlayerLeaderboardArgument("general")],
  })
  public general(context: CommandContext) {
    return this.run(context, "general", GENERAL_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.megawalls"),
    args: [new PlayerLeaderboardArgument("megawalls")],
  })
  public megawalls(context: CommandContext) {
    return this.run(context, "megawalls", MEGAWALLS_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.murdermystery"),
    args: [new PlayerLeaderboardArgument("murdermystery")],
  })
  public murdermystery(context: CommandContext) {
    return this.run(context, "murdermystery", MURDER_MYSTERY_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.paintball"),
    args: [new PlayerLeaderboardArgument("paintball")],
  })
  public paintball(context: CommandContext) {
    return this.run(context, "paintball", PAINTBALL_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.parkour"),
    args: [new PlayerLeaderboardArgument("parkour")],
  })
  public parkour(context: CommandContext) {
    return this.run(context, "parkour", PARKOUR_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.quake"),
    args: [new PlayerLeaderboardArgument("quake")],
  })
  public quake(context: CommandContext) {
    return this.run(context, "quake", QUAKE_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.skywars"),
    args: [new PlayerLeaderboardArgument("skywars")],
  })
  public skywars(context: CommandContext) {
    return this.run(context, "skywars", SKYWARS_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.smashheroes"),
    args: [new PlayerLeaderboardArgument("smashheroes")],
  })
  public smashheroes(context: CommandContext) {
    return this.run(context, "smashheroes", SMASH_HEROES_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.speeduhc"),
    args: [new PlayerLeaderboardArgument("speeduhc")],
  })
  public speeduhc(context: CommandContext) {
    return this.run(context, "speeduhc", SPEED_UHC_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.tntgames"),
    args: [new PlayerLeaderboardArgument("tntgames")],
  })
  public tntgames(context: CommandContext) {
    return this.run(context, "tntgames", TNT_GAMES_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.turbokartracers"),
    args: [new PlayerLeaderboardArgument("turbokartracers")],
  })
  public turbokartracers(context: CommandContext) {
    return this.run(context, "turbokartracers", TURBO_KART_RACERS_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.uhc"),
    args: [new PlayerLeaderboardArgument("uhc")],
  })
  public uhc(context: CommandContext) {
    return this.run(context, "uhc", UHC_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.vampirez"),
    args: [new PlayerLeaderboardArgument("vampirez")],
  })
  public vampirez(context: CommandContext) {
    return this.run(context, "vampirez", VAMPIREZ_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.walls"),
    args: [new PlayerLeaderboardArgument("walls")],
  })
  public walls(context: CommandContext) {
    return this.run(context, "walls", WALLS_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.warlords"),
    args: [new PlayerLeaderboardArgument("warlords")],
  })
  public warlords(context: CommandContext) {
    return this.run(context, "warlords", WARLORDS_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.woolwars"),
    args: [new PlayerLeaderboardArgument("woolwars")],
  })
  public woolwars(context: CommandContext) {
    return this.run(context, "woolwars", WOOL_WARS_MODES);
  }

  private async run<T extends GamesWithBackgrounds>(
    context: CommandContext,
    prefix: keyof PlayerStats,
    modes: T
  ) {
    const leaderboard = context.option<string>("leaderboard");

    const field = `stats.${prefix}.${leaderboard.replaceAll(" ", ".")}`;
    const background = await getBackground(...mapBackground(modes, modes[0]));

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
