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
  BRIDGE_MODES,
  BUILD_BATTLE_MODES,
  COPS_AND_CRIMS_MODES,
  DUELS_MODES,
  GENERAL_MODES,
  GameMode,
  GameModes,
  MEGAWALLS_MODES,
  MURDER_MYSTERY_MODES,
  PAINTBALL_MODES,
  PIT_MODES,
  Player,
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
  Command,
  CommandContext,
  Page,
  PaginateService,
  SubCommand,
} from "@statsify/discord";
import { ArcadeProfile } from "../arcade/arcade.profile";
import { ArenaBrawlProfile } from "../arenabrawl/arenabrawl.profile";
import { BedWarsProfile } from "../bedwars/bedwars.profile";
import { BlitzSGProfile, filterBlitzKits } from "../blitzsg/blitzsg.profile";
import { BridgeProfile } from "../duels/bridge.profile";
import { BuildBattleProfile } from "../buildbattle/buildbattle.profile";
import { CopsAndCrimsProfile } from "../copsandcrims/copsandcrims.profile";
import { DateTime } from "luxon";
import { DuelsProfile } from "../duels/duels.profile";
import { GamesWithBackgrounds, mapBackground } from "#constants";
import { HistoricalGeneralProfile } from "../general/historical-general.profile";
import { HistoricalTimes } from "@statsify/api-client";
import { MegaWallsProfile } from "../megawalls/megawalls.profile";
import { MurderMysteryProfile } from "../murdermystery/murdermystery.profile";
import { PaintballProfile } from "../paintball/paintball.profile";
import { PitProfile } from "../pit/pit.profile";
import { QuakeProfile } from "../quake/quake.profile";
import { SkyWarsProfile } from "../skywars/skywars.profile";
import { SmashHeroesProfile } from "../smashheroes/smashheroes.profile";
import { SpeedUHCProfile } from "../speeduhc/speeduhc.profile";
import { TNTGamesProfile } from "../tntgames/tntgames.profile";
import { TurboKartRacersProfile } from "../turbokartracers/turbokartracers.profile";
import { UHCProfile } from "../uhc/uhc.profile";
import { VampireZProfile } from "../vampirez/vampirez.profile";
import { WallsProfile } from "../walls/walls.profile";
import { WarlordsProfile } from "../warlords/warlords.profile";
import { WoolWarsProfile } from "../woolwars/woolwars.profile";
import { getBackground, getLogo } from "@statsify/assets";
import { getTheme } from "#themes";
import { render } from "@statsify/rendering";
import type { BaseProfileProps } from "../base.hypixel-command";

const tier = UserTier.STAFF;
const preview = "session.png";

@Command({ description: "" })
export class SessionCommand {
  public constructor(
    private readonly apiService: ApiService,
    private readonly paginateService: PaginateService
  ) {}

  @SubCommand({ description: (t) => t("commands.session-arcade"), tier, preview })
  public arcade(context: CommandContext) {
    return this.run(context, ARCADE_MODES, (base, mode) => (
      <ArcadeProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({
    description: (t) => t("commands.session-arenabrawl"),
    tier,
    preview,
    group: "classic",
  })
  public arenabrawl(context: CommandContext) {
    return this.run(context, ARENA_BRAWL_MODES, (base, mode) => (
      <ArenaBrawlProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({ description: (t) => t("commands.session-bedwars"), tier, preview })
  public bedwars(context: CommandContext) {
    return this.run(context, BEDWARS_MODES, (base, mode) => (
      <BedWarsProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({ description: (t) => t("commands.session-bridge"), tier, preview })
  public bridge(context: CommandContext) {
    return this.run(context, BRIDGE_MODES, (base, mode) => (
      <BridgeProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({ description: (t) => t("commands.session-blitzsg"), tier, preview })
  public blitzsg(context: CommandContext) {
    return this.run(
      context,
      BLITZSG_MODES,
      (base, mode) => <BlitzSGProfile {...base} mode={mode} />,
      filterBlitzKits
    );
  }

  @SubCommand({ description: (t) => t("commands.session-buildbattle"), tier, preview })
  public buildbattle(context: CommandContext) {
    return this.run(context, BUILD_BATTLE_MODES, (base) => (
      <BuildBattleProfile {...base} />
    ));
  }

  @SubCommand({ description: (t) => t("commands.session-copsandcrims"), tier, preview })
  public copsandcrims(context: CommandContext) {
    return this.run(context, COPS_AND_CRIMS_MODES, (base, mode) => (
      <CopsAndCrimsProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({ description: (t) => t("commands.session-duels"), tier, preview })
  public duels(context: CommandContext) {
    return this.run(context, DUELS_MODES, (base, mode) => (
      <DuelsProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({ description: (t) => t("commands.session-general"), tier, preview })
  public general(context: CommandContext) {
    return this.run(context, GENERAL_MODES, (base) => (
      <HistoricalGeneralProfile {...base} />
    ));
  }

  @SubCommand({ description: (t) => t("commands.session-megawalls"), tier, preview })
  public megawalls(context: CommandContext) {
    return this.run(context, MEGAWALLS_MODES, (base, mode) => (
      <MegaWallsProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({ description: (t) => t("commands.session-murdermystery"), tier, preview })
  public murdermystery(context: CommandContext) {
    return this.run(context, MURDER_MYSTERY_MODES, (base, mode) => (
      <MurderMysteryProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({
    description: (t) => t("commands.session-paintball"),
    tier,
    preview,
    group: "classic",
  })
  public paintball(context: CommandContext) {
    return this.run(context, PAINTBALL_MODES, (base) => <PaintballProfile {...base} />);
  }

  @SubCommand({ description: (t) => t("commands.session-pit"), tier, preview })
  public pit(context: CommandContext) {
    return this.run(context, PIT_MODES, (base) => <PitProfile {...base} />);
  }

  @SubCommand({
    description: (t) => t("commands.session-quake"),
    tier,
    preview,
    group: "classic",
  })
  public quake(context: CommandContext) {
    return this.run(context, QUAKE_MODES, (base, mode) => (
      <QuakeProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({ description: (t) => t("commands.session-skywars"), tier, preview })
  public skywars(context: CommandContext) {
    return this.run(context, SKYWARS_MODES, (base, mode) => (
      <SkyWarsProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({ description: (t) => t("commands.session-smashheroes"), tier, preview })
  public smashheroes(context: CommandContext) {
    return this.run(context, SMASH_HEROES_MODES, (base, mode) => (
      <SmashHeroesProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({ description: (t) => t("commands.session-speeduhc"), tier, preview })
  public speeduhc(context: CommandContext) {
    return this.run(context, SPEED_UHC_MODES, (base, mode) => (
      <SpeedUHCProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({ description: (t) => t("commands.session-tntgames"), tier, preview })
  public tntgames(context: CommandContext) {
    return this.run(context, TNT_GAMES_MODES, (base) => <TNTGamesProfile {...base} />);
  }

  @SubCommand({
    description: (t) => t("commands.session-turbokartracers"),
    tier,
    preview,
    group: "classic",
  })
  public turbokartracers(context: CommandContext) {
    return this.run(context, TURBO_KART_RACERS_MODES, (base) => (
      <TurboKartRacersProfile {...base} />
    ));
  }

  @SubCommand({ description: (t) => t("commands.session-uhc"), tier, preview })
  public uhc(context: CommandContext) {
    return this.run(context, UHC_MODES, (base, mode) => (
      <UHCProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({
    description: (t) => t("commands.session-vampirez"),
    tier,
    preview,
    group: "classic",
  })
  public vampirez(context: CommandContext) {
    return this.run(context, VAMPIREZ_MODES, (base, mode) => (
      <VampireZProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({
    description: (t) => t("commands.session-walls"),
    tier,
    preview,
    group: "classic",
  })
  public walls(context: CommandContext) {
    return this.run(context, WALLS_MODES, (base) => <WallsProfile {...base} />);
  }

  @SubCommand({ description: (t) => t("commands.session-warlords"), tier, preview })
  public warlords(context: CommandContext) {
    return this.run(context, WARLORDS_MODES, (base, mode) => (
      <WarlordsProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({ description: (t) => t("commands.session-woolwars"), tier, preview })
  public woolwars(context: CommandContext) {
    return this.run(context, WOOLWARS_MODES, (base, mode) => (
      <WoolWarsProfile {...base} mode={mode} />
    ));
  }

  protected async run<T extends GamesWithBackgrounds>(
    context: CommandContext,
    modes: GameModes<T>,
    getProfile: (base: BaseProfileProps, mode: GameMode<T>) => JSX.Element,
    filterModes?: (player: Player, modes: GameMode<T>[]) => GameMode<T>[]
  ) {
    const user = context.getUser();

    const player = await this.apiService.getPlayerHistorical(
      context.option("player"),
      HistoricalTimes.SESSION,
      false,
      user
    );

    const [logo, skin, badge] = await Promise.all([
      getLogo(user),
      this.apiService.getPlayerSkin(player.uuid),
      this.apiService.getUserBadge(player.uuid),
    ]);

    const allModes = modes.getModes();
    const displayedModes = filterModes ? filterModes(player, allModes) : allModes;

    const pages: Page[] = displayedModes.map((mode) => ({
      label: mode.formatted,
      generator: async (t) => {
        const background = await getBackground(...mapBackground(modes, mode.api));

        const displayName = this.apiService.emojiDisplayName(t, player.displayName);

        const content = player.isNew
          ? t("historical.newSession", { displayName })
          : undefined;

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
              sessionReset: player.sessionReset
                ? DateTime.fromSeconds(player.sessionReset)
                : DateTime.now(),
            },
          },
          mode
        );

        const canvas = render(profile, getTheme(user));
        const buffer = await canvas.toBuffer("png");

        return {
          content,
          files: [{ name: `session.png`, data: buffer, type: "image/png" }],
          attachments: [],
        };
      },
    }));

    return this.paginateService.paginate(context, pages);
  }
}
