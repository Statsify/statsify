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
  type ApiModeFromGameModes,
  ApiSubModeForMode,
  BEDWARS_MODES,
  BLITZSG_MODES,
  BUILD_BATTLE_MODES,
  COPS_AND_CRIMS_MODES,
  DUELS_MODES,
  GENERAL_MODES,
  GameMode,
  type GameModeWithSubModes,
  GameModes,
  MEGAWALLS_MODES,
  MURDER_MYSTERY_MODES,
  PAINTBALL_MODES,
  PIT_MODES,
  type Player,
  QUAKE_MODES,
  SKYWARS_MODES,
  SMASH_HEROES_MODES,
  SPEED_UHC_MODES,
  type SubModeForMode,
  TNT_GAMES_MODES,
  TURBO_KART_RACERS_MODES,
  UHC_MODES,
  VAMPIREZ_MODES,
  WALLS_MODES,
  WARLORDS_MODES,
  WOOLGAMES_MODES,
} from "@statsify/schemas";
import {
  ApiService,
  Command,
  CommandContext,
  EmbedBuilder,
  Page,
  PaginateService,
  PlayerArgument,
  SubCommand,
  SubPage,
} from "@statsify/discord";
import { ArcadeProfile } from "#commands/arcade/arcade.profile";
import { ArenaBrawlProfile } from "#commands/arenabrawl/arenabrawl.profile";
import { BedWarsProfile } from "#commands/bedwars/bedwars.profile";
import { BlitzSGProfile } from "#commands/blitzsg/blitzsg.profile";
import { BuildBattleProfile } from "#commands/buildbattle/buildbattle.profile";
import { CopsAndCrimsProfile } from "#commands/copsandcrims/copsandcrims.profile";
import { DateTime } from "luxon";
import { DuelsProfile } from "#commands/duels/duels.profile";
import { type GamesWithBackgrounds, mapBackground } from "#constants";
import { HistoricalGeneralProfile } from "#commands/general/historical-general.profile";
import { HistoricalTimes } from "@statsify/api-client";
import { MegaWallsProfile } from "#commands/megawalls/megawalls.profile";
import { MurderMysteryProfile } from "#commands/murdermystery/murdermystery.profile";
import { PaintballProfile } from "#commands/paintball/paintball.profile";
import { PitProfile } from "#commands/pit/pit.profile";
import { QuakeProfile } from "#commands/quake/quake.profile";
import { STATUS_COLORS } from "@statsify/logger";
import { SkyWarsProfile } from "#commands/skywars/skywars.profile";
import { SmashHeroesProfile } from "#commands/smashheroes/smashheroes.profile";
import { SpeedUHCProfile } from "#commands/speeduhc/speeduhc.profile";
import { TNTGamesProfile } from "#commands/tntgames/tntgames.profile";
import { TurboKartRacersProfile } from "#commands/turbokartracers/turbokartracers.profile";
import { UHCProfile } from "#commands/uhc/uhc.profile";
import { VampireZProfile } from "#commands/vampirez/vampirez.profile";
import { WallsProfile } from "#commands/walls/walls.profile";
import { WarlordsProfile } from "#commands/warlords/warlords.profile";
import { WoolGamesProfile } from "#commands/woolgames/woolgames.profile";
import { filterBlitzKits } from "#commands/blitzsg/blitzsg.command";
import { filterMegaWallsKits } from "#commands/megawalls/megawalls.command";
import { getArcadeModeEmojis, getArcadeSubModeEmojis } from "#commands/arcade/arcade.command";
import { getBackground, getLogo } from "@statsify/assets";
import { getDuelsModeEmojis } from "#commands/duels/duels.command";
import { getTheme } from "#themes";
import { render } from "@statsify/rendering";
import type { BaseProfileProps, ModeEmoji } from "#commands/base.hypixel-command";
import type { HistoricalTimeData } from "#components";

@Command({ description: "session stats" })
export class SessionCommand {
  public constructor(
    private readonly apiService: ApiService,
    private readonly paginateService: PaginateService
  ) {}

  @SubCommand({ description: (t) => t("commands.session-arcade"), args: [PlayerArgument] })
  public arcade(context: CommandContext) {
    return this.run({
      context,
      modes: ARCADE_MODES,
      getProfile: (base, mode) => <ArcadeProfile {...base} mode={mode} />,
      filterSubmodes: (_, mode) => {
        if (mode.api === "dropper") return mode.submodes.filter((submode) => submode.api !== "bestTimes");
        if (mode.api === "partyGames") return mode.submodes.filter((submode) => submode.api !== "roundWins");
        return mode.submodes;
      },
      getModeEmojis: getArcadeModeEmojis,
      getSubModeEmojis: getArcadeSubModeEmojis,
    });
  }

  @SubCommand({
    description: (t) => t("commands.session-arenabrawl"),
    group: "classic",
    args: [PlayerArgument],
  })
  public arenabrawl(context: CommandContext) {
    return this.run({
      context,
      modes: ARENA_BRAWL_MODES,
      getProfile: (base, mode) => <ArenaBrawlProfile {...base} mode={mode} />,
    });
  }

  @SubCommand({ description: (t) => t("commands.session-bedwars"), args: [PlayerArgument] })
  public bedwars(context: CommandContext) {
    return this.run({
      context,
      modes: BEDWARS_MODES,
      getProfile: (base, mode) => <BedWarsProfile {...base} mode={mode} />,
    });
  }

  @SubCommand({ description: (t) => t("commands.session-blitzsg"), args: [PlayerArgument] })
  public blitzsg(context: CommandContext) {
    return this.run({
      context,
      modes: BLITZSG_MODES,
      getProfile: (base, mode) => <BlitzSGProfile {...base} mode={mode} />,
      filterModes: filterBlitzKits,
    });
  }

  @SubCommand({ description: (t) => t("commands.session-buildbattle"), args: [PlayerArgument] })
  public buildbattle(context: CommandContext) {
    return this.run({
      context,
      modes: BUILD_BATTLE_MODES,
      getProfile: (base) => <BuildBattleProfile {...base} />,
    });
  }

  @SubCommand({ description: (t) => t("commands.session-copsandcrims"), args: [PlayerArgument] })
  public copsandcrims(context: CommandContext) {
    return this.run({
      context,
      modes: COPS_AND_CRIMS_MODES,
      getProfile: (base, mode) => <CopsAndCrimsProfile {...base} mode={mode} />,
    });
  }

  @SubCommand({ description: (t) => t("commands.session-duels"), args: [PlayerArgument] })
  public duels(context: CommandContext) {
    return this.run({
      context,
      modes: DUELS_MODES,
      getProfile: (base, mode) => <DuelsProfile {...base} mode={mode} />,
      filterSubmodes: (_, mode) => {
        if (mode.api === "overall") return mode.submodes.filter((submode) => submode.api !== "titles");
        return mode.submodes;
      },
      getModeEmojis: getDuelsModeEmojis,
    });
  }

  @SubCommand({ description: (t) => t("commands.session-general"), args: [PlayerArgument] })
  public general(context: CommandContext) {
    return this.run({
      context,
      modes: GENERAL_MODES,
      getProfile: (base) => <HistoricalGeneralProfile {...base} />,
    });
  }

  @SubCommand({ description: (t) => t("commands.session-megawalls"), args: [PlayerArgument] })
  public megawalls(context: CommandContext) {
    return this.run({
      context,
      modes: MEGAWALLS_MODES,
      getProfile: (base, mode) => <MegaWallsProfile {...base} mode={mode} />,
      filterModes: filterMegaWallsKits,
    });
  }

  @SubCommand({ description: (t) => t("commands.session-murdermystery"), args: [PlayerArgument] })
  public murdermystery(context: CommandContext) {
    return this.run({
      context,
      modes: MURDER_MYSTERY_MODES,
      getProfile: (base, mode) => <MurderMysteryProfile {...base} mode={mode} />,
    });
  }

  @SubCommand({
    description: (t) => t("commands.session-paintball"),
    group: "classic",
    args: [PlayerArgument],
  })
  public paintball(context: CommandContext) {
    return this.run({
      context,
      modes: PAINTBALL_MODES,
      getProfile: (base) => <PaintballProfile {...base} />,
    });
  }

  @SubCommand({ description: (t) => t("commands.session-pit"), args: [PlayerArgument] })
  public pit(context: CommandContext) {
    return this.run({
      context,
      modes: PIT_MODES,
      getProfile: (base) => <PitProfile {...base} />,
    });
  }

  @SubCommand({
    description: (t) => t("commands.session-quake"),
    group: "classic",
    args: [PlayerArgument],
  })
  public quake(context: CommandContext) {
    return this.run({
      context,
      modes: QUAKE_MODES,
      getProfile: (base, mode) => <QuakeProfile {...base} mode={mode} />,
    });
  }

  @SubCommand({ description: (t) => t("commands.session-skywars"), args: [PlayerArgument] })
  public skywars(context: CommandContext) {
    return this.run({
      context,
      modes: SKYWARS_MODES,
      getProfile: (base, mode) => <SkyWarsProfile {...base} mode={mode} />,
    });
  }

  @SubCommand({ description: (t) => t("commands.session-smashheroes"), args: [PlayerArgument] })
  public smashheroes(context: CommandContext) {
    return this.run({
      context,
      modes: SMASH_HEROES_MODES,
      getProfile: (base, mode) => <SmashHeroesProfile {...base} mode={mode} />,
    });
  }

  @SubCommand({ description: (t) => t("commands.session-speeduhc"), args: [PlayerArgument] })
  public speeduhc(context: CommandContext) {
    return this.run({
      context,
      modes: SPEED_UHC_MODES,
      getProfile: (base, mode) => <SpeedUHCProfile {...base} mode={mode} />,
    });
  }

  @SubCommand({ description: (t) => t("commands.session-tntgames"), args: [PlayerArgument] })
  public tntgames(context: CommandContext) {
    return this.run({
      context,
      modes: TNT_GAMES_MODES,
      getProfile: (base, mode) => <TNTGamesProfile {...base} mode={mode} />,
    });
  }

  @SubCommand({
    description: (t) => t("commands.session-turbokartracers"),
    group: "classic",
    args: [PlayerArgument],
  })
  public turbokartracers(context: CommandContext) {
    return this.run({
      context,
      modes: TURBO_KART_RACERS_MODES,
      getProfile: (base) => <TurboKartRacersProfile {...base} />,
    });
  }

  @SubCommand({ description: (t) => t("commands.session-uhc"), args: [PlayerArgument] })
  public uhc(context: CommandContext) {
    return this.run({
      context,
      modes: UHC_MODES,
      getProfile: (base, mode) => <UHCProfile {...base} mode={mode} />,
    });
  }

  @SubCommand({
    description: (t) => t("commands.session-vampirez"),
    group: "classic",
    args: [PlayerArgument],
  })
  public vampirez(context: CommandContext) {
    return this.run({
      context,
      modes: VAMPIREZ_MODES,
      getProfile: (base, mode) => <VampireZProfile {...base} mode={mode} />,
    });
  }

  @SubCommand({
    description: (t) => t("commands.session-walls"),
    group: "classic",
    args: [PlayerArgument],
  })
  public walls(context: CommandContext) {
    return this.run({
      context,
      modes: WALLS_MODES,
      getProfile: (base) => <WallsProfile {...base} />,
    });
  }

  @SubCommand({ description: (t) => t("commands.session-warlords"), args: [PlayerArgument] })
  public warlords(context: CommandContext) {
    return this.run({
      context,
      modes: WARLORDS_MODES,
      getProfile: (base, mode) => <WarlordsProfile {...base} mode={mode} />,
    });
  }

  @SubCommand({ description: (t) => t("commands.session-woolgames"), args: [PlayerArgument] })
  public woolgames(context: CommandContext) {
    return this.run({
      context,
      modes: WOOLGAMES_MODES,
      getProfile: (base, mode) => <WoolGamesProfile {...base} mode={mode} />,
    });
  }

  @SubCommand({ description: (t) => t("commands.session-delete") })
  public async delete(context: CommandContext) {
    const userId = context.getInteraction().getUserId();
    await this.apiService.deletePlayerSession(userId);

    const embed = new EmbedBuilder()
      .color(STATUS_COLORS.success)
      .description((t) => t("historical.deleteSession"));

    return { embeds: [embed] };
  }

  protected async run<T extends GamesWithBackgrounds>({
    context,
    modes,
    getProfile,
    filterModes,
    filterSubmodes,
    getModeEmojis,
    getSubModeEmojis,
  }: {
    context: CommandContext;
    modes: GameModes<T>;
    getProfile: (base: Omit<BaseProfileProps, "time"> & { time: HistoricalTimeData }, mode: GameMode<T>) => JSX.Element;
    filterModes?: (player: Player, modes: GameModeWithSubModes<T>[]) => GameModeWithSubModes<T>[];
    filterSubmodes?: (player: Player, mode: GameModeWithSubModes<T>) => GameModeWithSubModes<T>["submodes"];
    getModeEmojis?(modes: GameModeWithSubModes<T>[]): ModeEmoji[];
    getSubModeEmojis?<M extends ApiModeFromGameModes<T>>(mode: M, submodes: SubModeForMode<T, M>[]): ModeEmoji[];
  }) {
    const user = context.getUser();

    const player = await this.apiService.getPlayerSession(
      context.option("player"),
      user?.uuid,
      user
    );

    const [logo, skin, badge] = await Promise.all([
      getLogo(user),
      this.apiService.getPlayerSkin(player.uuid),
      this.apiService.getUserBadge(player.uuid),
    ]);

    const allModes = modes.getModes();
    const displayedModes = filterModes ? filterModes(player, allModes) : allModes;
    const modeEmojis = getModeEmojis ? getModeEmojis(displayedModes) : [];

    const pages: Page[] = displayedModes.map((mode, index) => {
      const submodes = filterSubmodes?.(player, mode) ?? mode.submodes;

      if (submodes.length === 0) return {
        label: mode.formatted,
        emoji: modeEmojis[index],
        generator: async (t) => {
          const background = await getBackground(...mapBackground(modes, mode.api));

          const displayName = this.apiService.emojiDisplayName(t, player.displayName);

          let content: string | undefined = undefined;

          if (player.isNew) {
            content = t("historical.newSession", { displayName });
          } else if (Math.random() < 0.1) {
            content = t("tips.resetSession");
          }

          const profile = getProfile(
            {
              player,
              skin,
              background,
              logo,
              t,
              user,
              badge,
              time: {
                timeType: HistoricalTimes.SESSION,
                sessionReset: player.sessionReset ?
                  DateTime.fromSeconds(player.sessionReset) :
                  DateTime.now(),
              },
            },
            { ...mode, submode: undefined } as unknown as GameMode<T>
          );

          const canvas = render(profile, getTheme(user));
          const buffer = await canvas.toBuffer("png");

          return {
            content,
            files: [{ name: "session.png", data: buffer, type: "image/png" }],
            attachments: [],
          };
        },
      };

      const submodeEmojis = getSubModeEmojis ? getSubModeEmojis(mode.api, submodes) : [];

      const subPages = submodes.map((submode, index): SubPage => ({
        label: submode.formatted,
        emoji: submodeEmojis[index],
        generator: async (t) => {
          const background = await getBackground(...mapBackground(modes, mode.api, submode.api as ApiSubModeForMode<T, (typeof mode)["api"]>));

          const profile = getProfile(
            {
              player,
              skin,
              background,
              logo,
              t,
              user,
              badge,
              time: {
                timeType: HistoricalTimes.SESSION,
                sessionReset: player.sessionReset ?
                  DateTime.fromSeconds(player.sessionReset) :
                  DateTime.now(),
              },
            },
            { api: mode.api, formatted: mode.formatted, hypixel: mode.hypixel, submode } as GameMode<T>
          );

          const canvas = render(profile, getTheme(user));
          const buffer = await canvas.toBuffer("png");

          return {
            files: [{ name: "session.png", data: buffer, type: "image/png" }],
            attachments: [],
          };
        },
      }));

      return {
        label: mode.formatted,
        emoji: modeEmojis[index],
        subPages,
      };
    });

    return this.paginateService.paginate(context, pages);
  }
}
