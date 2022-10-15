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
  PlayerStats,
  QUAKE_MODES,
  QUEST_MODES,
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
import {
  ApiService,
  ChoiceArgument,
  Command,
  CommandContext,
  SubCommand,
} from "@statsify/discord";
import { BaseLeaderboardCommand } from "./base.leaderboard-command";
import { GamesWithBackgrounds, mapBackground } from "#constants";
import { GuildLeaderboardArgument } from "./guild-leaderboard.argument";
import { GuildLeaderboardSubCommand } from "./guild-leaderboard.subcommand";
import {
  PlayerLeaderboardArgument,
  SHORT_TO_LONG_HISTORICAL_TYPE,
} from "./player-leaderboard.argument";
import { getBackground } from "@statsify/assets";

const HISTORICAL_ARGUMENT = new ChoiceArgument({
  name: "time",
  choices: [
    ["Lifetime", "L"],
    ["Daily", "D"],
    ["Weekly", "W"],
    ["Monthly", "M"],
  ],
});

@Command({
  name: "leaderboard",
  // Description isn't shown so use "G" to save space on the 4000 character limit.
  description: "G",
})
export class PlayerLeaderboardCommand extends BaseLeaderboardCommand {
  public constructor(private readonly apiService: ApiService) {
    super();
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-arcade"),
    args: [HISTORICAL_ARGUMENT, new PlayerLeaderboardArgument("arcade")],
  })
  public arcade(context: CommandContext) {
    return this.run(context, "arcade", ARCADE_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-arenabrawl"),
    args: [HISTORICAL_ARGUMENT, new PlayerLeaderboardArgument("arenabrawl")],
    group: "classic",
  })
  public arenabrawl(context: CommandContext) {
    return this.run(context, "arenabrawl", ARENA_BRAWL_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-bedwars"),
    args: [HISTORICAL_ARGUMENT, new PlayerLeaderboardArgument("bedwars")],
  })
  public bedwars(context: CommandContext) {
    return this.run(context, "bedwars", BEDWARS_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-blitzsg"),
    args: [HISTORICAL_ARGUMENT, new PlayerLeaderboardArgument("blitzsg")],
  })
  public blitzsg(context: CommandContext) {
    return this.run(context, "blitzsg", BLITZSG_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-buildbattle"),
    args: [HISTORICAL_ARGUMENT, new PlayerLeaderboardArgument("buildbattle")],
  })
  public buildbattle(context: CommandContext) {
    return this.run(context, "buildbattle", BUILD_BATTLE_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-challenges"),
    args: [HISTORICAL_ARGUMENT, new PlayerLeaderboardArgument("challenges")],
  })
  public challenges(context: CommandContext) {
    return this.run(context, "challenges", CHALLENGE_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-copsandcrims"),
    args: [HISTORICAL_ARGUMENT, new PlayerLeaderboardArgument("copsandcrims")],
  })
  public copsandcrims(context: CommandContext) {
    return this.run(context, "copsandcrims", COPS_AND_CRIMS_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-duels"),
    args: [HISTORICAL_ARGUMENT, new PlayerLeaderboardArgument("duels")],
  })
  public duels(context: CommandContext) {
    return this.run(context, "duels", DUELS_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-general"),
    args: [HISTORICAL_ARGUMENT, new PlayerLeaderboardArgument("general")],
  })
  public general(context: CommandContext) {
    return this.run(context, "general", GENERAL_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-megawalls"),
    args: [HISTORICAL_ARGUMENT, new PlayerLeaderboardArgument("megawalls")],
  })
  public megawalls(context: CommandContext) {
    return this.run(context, "megawalls", MEGAWALLS_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-murdermystery"),
    args: [HISTORICAL_ARGUMENT, new PlayerLeaderboardArgument("murdermystery")],
  })
  public murdermystery(context: CommandContext) {
    return this.run(context, "murdermystery", MURDER_MYSTERY_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-paintball"),
    args: [HISTORICAL_ARGUMENT, new PlayerLeaderboardArgument("paintball")],
    group: "classic",
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
    args: [HISTORICAL_ARGUMENT, new PlayerLeaderboardArgument("pit")],
  })
  public pit(context: CommandContext) {
    return this.run(context, "pit", PIT_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-quake"),
    args: [HISTORICAL_ARGUMENT, new PlayerLeaderboardArgument("quake")],
    group: "classic",
  })
  public quake(context: CommandContext) {
    return this.run(context, "quake", QUAKE_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-quests"),
    args: [new PlayerLeaderboardArgument("quests")],
  })
  public quests(context: CommandContext) {
    return this.run(context, "quests", QUEST_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-skywars"),
    args: [HISTORICAL_ARGUMENT, new PlayerLeaderboardArgument("skywars")],
  })
  public skywars(context: CommandContext) {
    return this.run(context, "skywars", SKYWARS_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-smashheroes"),
    args: [HISTORICAL_ARGUMENT, new PlayerLeaderboardArgument("smashheroes")],
  })
  public smashheroes(context: CommandContext) {
    return this.run(context, "smashheroes", SMASH_HEROES_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-speeduhc"),
    args: [HISTORICAL_ARGUMENT, new PlayerLeaderboardArgument("speeduhc")],
  })
  public speeduhc(context: CommandContext) {
    return this.run(context, "speeduhc", SPEED_UHC_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-tntgames"),
    args: [HISTORICAL_ARGUMENT, new PlayerLeaderboardArgument("tntgames")],
  })
  public tntgames(context: CommandContext) {
    return this.run(context, "tntgames", TNT_GAMES_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-turbokartracers"),
    args: [HISTORICAL_ARGUMENT, new PlayerLeaderboardArgument("turbokartracers")],
    group: "classic",
  })
  public turbokartracers(context: CommandContext) {
    return this.run(context, "turbokartracers", TURBO_KART_RACERS_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-uhc"),
    args: [HISTORICAL_ARGUMENT, new PlayerLeaderboardArgument("uhc")],
  })
  public uhc(context: CommandContext) {
    return this.run(context, "uhc", UHC_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-vampirez"),
    args: [HISTORICAL_ARGUMENT, new PlayerLeaderboardArgument("vampirez")],
    group: "classic",
  })
  public vampirez(context: CommandContext) {
    return this.run(context, "vampirez", VAMPIREZ_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-walls"),
    args: [HISTORICAL_ARGUMENT, new PlayerLeaderboardArgument("walls")],
    group: "classic",
  })
  public walls(context: CommandContext) {
    return this.run(context, "walls", WALLS_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-warlords"),
    args: [HISTORICAL_ARGUMENT, new PlayerLeaderboardArgument("warlords")],
  })
  public warlords(context: CommandContext) {
    return this.run(context, "warlords", WARLORDS_MODES);
  }

  @SubCommand({
    description: (t) => t("commands.leaderboard-woolwars"),
    args: [HISTORICAL_ARGUMENT, new PlayerLeaderboardArgument("woolwars")],
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
    const time =
      SHORT_TO_LONG_HISTORICAL_TYPE[
        context.option<keyof typeof SHORT_TO_LONG_HISTORICAL_TYPE>("time")
      ];

    const field = `stats.${prefix}.${leaderboard.replaceAll(" ", ".")}`;

    const background = await getBackground(
      ...mapBackground(modes, modes.getModes()[0].api)
    );

    const getLeaderboard = time
      ? this.apiService.getHistoricalLeaderboard.bind(this.apiService, time)
      : this.apiService.getPlayerLeaderboard.bind(this.apiService);

    return this.createLeaderboard({
      context,
      background,
      field,
      getLeaderboard,
      type: "player",
      getLeaderboardDataIcon: (id) => this.apiService.getPlayerHead(id, 24),
      time,
    });
  }
}
