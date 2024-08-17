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
  GameMode,
  GameModeWithSubModes,
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
  Page,
  PaginateService,
  PlayerArgument,
  SubCommand,
  SubPage,
} from "@statsify/discord";
import { ArcadeProfile } from "../arcade/arcade.profile.js";
import { ArenaBrawlProfile } from "../arenabrawl/arenabrawl.profile.js";
import { BedWarsProfile } from "../bedwars/bedwars.profile.js";
import { BlitzSGProfile, filterBlitzKits } from "../blitzsg/blitzsg.profile.js";
import { BuildBattleProfile } from "../buildbattle/buildbattle.profile.js";
import { CopsAndCrimsProfile } from "../copsandcrims/copsandcrims.profile.js";
import { DateTime } from "luxon";
import { DuelsProfile } from "../duels/duels.profile.js";
import { type GamesWithBackgrounds, mapBackground } from "#constants";
import { HistoricalGeneralProfile } from "../general/historical-general.profile.js";
import { HistoricalTimes } from "@statsify/api-client";
import { MegaWallsProfile, filterMegaWallsKits } from "../megawalls/megawalls.profile.js";
import { MurderMysteryProfile } from "../murdermystery/murdermystery.profile.js";
import { PaintballProfile } from "../paintball/paintball.profile.js";
import { PitProfile } from "../pit/pit.profile.js";
import { QuakeProfile } from "../quake/quake.profile.js";
import { SkyWarsProfile } from "../skywars/skywars.profile.js";
import { SmashHeroesProfile } from "../smashheroes/smashheroes.profile.js";
import { SpeedUHCProfile } from "../speeduhc/speeduhc.profile.js";
import { TNTGamesProfile } from "../tntgames/tntgames.profile.js";
import { TurboKartRacersProfile } from "../turbokartracers/turbokartracers.profile.js";
import { UHCProfile } from "../uhc/uhc.profile.js";
import { VampireZProfile } from "../vampirez/vampirez.profile.js";
import { WallsProfile } from "../walls/walls.profile.js";
import { WarlordsProfile } from "../warlords/warlords.profile.js";
import { WoolGamesProfile } from "../woolgames/woolgames.profile.js";
import { getBackground, getLogo } from "@statsify/assets";
import { getTheme } from "#themes";
import { render } from "@statsify/rendering";
import type { BaseProfileProps } from "#commands/base.hypixel-command";

@Command({ description: "session stats" })
export class SessionCommand {
  public constructor(
    private readonly apiService: ApiService,
    private readonly paginateService: PaginateService
  ) {}

  @SubCommand({ description: (t) => t("commands.session-arcade"), args: [PlayerArgument] })
  public arcade(context: CommandContext) {
    return this.run(
      context,
      ARCADE_MODES,
      (base, mode) => <ArcadeProfile {...base} mode={mode} />,
      undefined,
      (_, mode) => {
        if (mode.api === "dropper") return mode.submodes.filter((submode) => submode.api !== "bestTimes");
        if (mode.api === "partyGames") return mode.submodes.filter((submode) => submode.api !== "roundWins");
        return mode.submodes;
      }
    );
  }

  @SubCommand({
    description: (t) => t("commands.session-arenabrawl"),
    group: "classic",
    args: [PlayerArgument],
  })
  public arenabrawl(context: CommandContext) {
    return this.run(context, ARENA_BRAWL_MODES, (base, mode) => (
      <ArenaBrawlProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({ description: (t) => t("commands.session-bedwars"), args: [PlayerArgument] })
  public bedwars(context: CommandContext) {
    return this.run(context, BEDWARS_MODES, (base, mode) => (
      <BedWarsProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({ description: (t) => t("commands.session-blitzsg"), args: [PlayerArgument] })
  public blitzsg(context: CommandContext) {
    return this.run(
      context,
      BLITZSG_MODES,
      (base, mode) => <BlitzSGProfile {...base} mode={mode} />,
      filterBlitzKits
    );
  }

  @SubCommand({ description: (t) => t("commands.session-buildbattle"), args: [PlayerArgument] })
  public buildbattle(context: CommandContext) {
    return this.run(context, BUILD_BATTLE_MODES, (base) => (
      <BuildBattleProfile {...base} />
    ));
  }

  @SubCommand({ description: (t) => t("commands.session-copsandcrims"), args: [PlayerArgument] })
  public copsandcrims(context: CommandContext) {
    return this.run(context, COPS_AND_CRIMS_MODES, (base, mode) => (
      <CopsAndCrimsProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({ description: (t) => t("commands.session-duels"), args: [PlayerArgument] })
  public duels(context: CommandContext) {
    return this.run(context, DUELS_MODES, (base, mode) => (
      <DuelsProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({ description: (t) => t("commands.session-general"), args: [PlayerArgument] })
  public general(context: CommandContext) {
    return this.run(context, GENERAL_MODES, (base) => (
      <HistoricalGeneralProfile {...base} />
    ));
  }

  @SubCommand({ description: (t) => t("commands.session-megawalls"), args: [PlayerArgument] })
  public megawalls(context: CommandContext) {
    return this.run(
      context,
      MEGAWALLS_MODES,
      (base, mode) => <MegaWallsProfile {...base} mode={mode} />,
      filterMegaWallsKits
    );
  }

  @SubCommand({ description: (t) => t("commands.session-murdermystery"), args: [PlayerArgument] })
  public murdermystery(context: CommandContext) {
    return this.run(context, MURDER_MYSTERY_MODES, (base, mode) => (
      <MurderMysteryProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({
    description: (t) => t("commands.session-paintball"),
    group: "classic",
    args: [PlayerArgument],
  })
  public paintball(context: CommandContext) {
    return this.run(context, PAINTBALL_MODES, (base) => <PaintballProfile {...base} />);
  }

  @SubCommand({ description: (t) => t("commands.session-pit"), args: [PlayerArgument] })
  public pit(context: CommandContext) {
    return this.run(context, PIT_MODES, (base) => <PitProfile {...base} />);
  }

  @SubCommand({
    description: (t) => t("commands.session-quake"),
    group: "classic",
    args: [PlayerArgument],
  })
  public quake(context: CommandContext) {
    return this.run(context, QUAKE_MODES, (base, mode) => (
      <QuakeProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({ description: (t) => t("commands.session-skywars"), args: [PlayerArgument] })
  public skywars(context: CommandContext) {
    return this.run(context, SKYWARS_MODES, (base, mode) => (
      <SkyWarsProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({ description: (t) => t("commands.session-smashheroes"), args: [PlayerArgument] })
  public smashheroes(context: CommandContext) {
    return this.run(context, SMASH_HEROES_MODES, (base, mode) => (
      <SmashHeroesProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({ description: (t) => t("commands.session-speeduhc"), args: [PlayerArgument] })
  public speeduhc(context: CommandContext) {
    return this.run(context, SPEED_UHC_MODES, (base, mode) => (
      <SpeedUHCProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({ description: (t) => t("commands.session-tntgames"), args: [PlayerArgument] })
  public tntgames(context: CommandContext) {
    return this.run(context, TNT_GAMES_MODES, (base) => <TNTGamesProfile {...base} />);
  }

  @SubCommand({
    description: (t) => t("commands.session-turbokartracers"),
    group: "classic",
    args: [PlayerArgument],
  })
  public turbokartracers(context: CommandContext) {
    return this.run(context, TURBO_KART_RACERS_MODES, (base) => (
      <TurboKartRacersProfile {...base} />
    ));
  }

  @SubCommand({ description: (t) => t("commands.session-uhc"), args: [PlayerArgument] })
  public uhc(context: CommandContext) {
    return this.run(context, UHC_MODES, (base, mode) => (
      <UHCProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({
    description: (t) => t("commands.session-vampirez"),
    group: "classic",
    args: [PlayerArgument],
  })
  public vampirez(context: CommandContext) {
    return this.run(context, VAMPIREZ_MODES, (base, mode) => (
      <VampireZProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({
    description: (t) => t("commands.session-walls"),
    group: "classic",
    args: [PlayerArgument],
  })
  public walls(context: CommandContext) {
    return this.run(context, WALLS_MODES, (base) => <WallsProfile {...base} />);
  }

  @SubCommand({ description: (t) => t("commands.session-warlords"), args: [PlayerArgument] })
  public warlords(context: CommandContext) {
    return this.run(context, WARLORDS_MODES, (base, mode) => (
      <WarlordsProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({ description: (t) => t("commands.session-woolgames"), args: [PlayerArgument] })
  public woolgames(context: CommandContext) {
    return this.run(context, WOOLGAMES_MODES, (base, mode) => (
      <WoolGamesProfile {...base} mode={mode} />
    ));
  }

  protected async run<T extends GamesWithBackgrounds>(
    context: CommandContext,
    modes: GameModes<T>,
    getProfile: (base: BaseProfileProps, mode: GameMode<T>) => JSX.Element,
    filterModes?: (player: Player, modes: GameModeWithSubModes<T>[]) => GameModeWithSubModes<T>[],
    filterSubmodes?: (player: Player, mode: GameModeWithSubModes<T>) => GameModeWithSubModes<T>["submodes"]
  ) {
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

    const pages: Page[] = displayedModes.map((mode) => {
      const submodes = filterSubmodes?.(player, mode) ?? mode.submodes;

      if (submodes.length === 0) return {
        label: mode.formatted,
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

      const subPages = submodes.map((submode): SubPage => ({
        label: submode.formatted,
        generator: async (t) => {
          const background = await getBackground(...mapBackground(modes, mode.api));

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

      return { label: mode.formatted, subPages };
    });

    return this.paginateService.paginate(context, pages);
  }
}
