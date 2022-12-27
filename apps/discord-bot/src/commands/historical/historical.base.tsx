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
  BRIDGE_MODES,
  BUILD_BATTLE_MODES,
  BlitzSGKit,
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
  PlayerArgument,
  SubCommand,
} from "@statsify/discord";
import { ArcadeProfile } from "../arcade/arcade.profile";
import { ArenaBrawlProfile } from "../arenabrawl/arenabrawl.profile";
import { BedWarsProfile } from "../bedwars/bedwars.profile";
import { BlitzSGProfile } from "../blitzsg/blitzsg.profile";
import { BridgeProfile } from "../duels/bridge.profile";
import { BuildBattleProfile } from "../buildbattle/buildbattle.profile";
import { CopsAndCrimsProfile } from "../copsandcrims/copsandcrims.profile";
import { DateTime } from "luxon";
import { DuelsProfile } from "../duels/duels.profile";
import { GamesWithBackgrounds, mapBackground } from "#constants";
import { HistoricalGeneralProfile } from "../general/historical-general.profile";
import { HistoricalTimes, HistoricalType } from "@statsify/api-client";
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

const args = [PlayerArgument];

@Command({ description: "" })
export class HistoricalBase {
  private readonly apiService: ApiService;
  private readonly paginateService: PaginateService;

  public constructor(private readonly time: HistoricalType) {
    this.apiService = Container.get(ApiService);
    this.paginateService = Container.get(PaginateService);
  }

  @SubCommand({ description: (t) => t("commands.historical-arcade"), args })
  public arcade(context: CommandContext) {
    return this.run(context, ARCADE_MODES, (base, mode) => (
      <ArcadeProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({
    description: (t) => t("commands.historical-arenabrawl"),
    args,
    group: "classic",
  })
  public arenabrawl(context: CommandContext) {
    return this.run(context, ARENA_BRAWL_MODES, (base, mode) => (
      <ArenaBrawlProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({ description: (t) => t("commands.historical-bedwars"), args })
  public bedwars(context: CommandContext) {
    return this.run(context, BEDWARS_MODES, (base, mode) => (
      <BedWarsProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({ description: (t) => t("commands.historical-bridge"), args })
  public bridge(context: CommandContext) {
    return this.run(context, BRIDGE_MODES, (base, mode) => (
      <BridgeProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({ description: (t) => t("commands.historical-blitzsg"), args })
  public blitzsg(context: CommandContext) {
    return this.run(
      context,
      BLITZSG_MODES,
      (base, mode) => <BlitzSGProfile {...base} mode={mode} />,
      (player, modes) => {
        const { blitzsg } = player.stats;
        const [overall, ...kits] = modes;

        const filteredKits = kits
          .sort(
            (a, b) =>
              (blitzsg[b.api] as BlitzSGKit).exp - (blitzsg[a.api] as BlitzSGKit).exp
          )
          .slice(0, 24);

        return [overall, ...filteredKits];
      }
    );
  }

  @SubCommand({ description: (t) => t("commands.historical-buildbattle"), args })
  public buildbattle(context: CommandContext) {
    return this.run(context, BUILD_BATTLE_MODES, (base) => (
      <BuildBattleProfile {...base} />
    ));
  }

  @SubCommand({ description: (t) => t("commands.historical-copsandcrims"), args })
  public copsandcrims(context: CommandContext) {
    return this.run(context, COPS_AND_CRIMS_MODES, (base, mode) => (
      <CopsAndCrimsProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({ description: (t) => t("commands.historical-duels"), args })
  public duels(context: CommandContext) {
    return this.run(context, DUELS_MODES, (base, mode) => (
      <DuelsProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({ description: (t) => t("commands.historical-general"), args })
  public general(context: CommandContext) {
    return this.run(context, GENERAL_MODES, (base) => (
      <HistoricalGeneralProfile {...base} />
    ));
  }

  @SubCommand({ description: (t) => t("commands.historical-megawalls"), args })
  public megawalls(context: CommandContext) {
    return this.run(context, MEGAWALLS_MODES, (base, mode) => (
      <MegaWallsProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({ description: (t) => t("commands.historical-murdermystery"), args })
  public murdermystery(context: CommandContext) {
    return this.run(context, MURDER_MYSTERY_MODES, (base, mode) => (
      <MurderMysteryProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({
    description: (t) => t("commands.historical-paintball"),
    args,
    group: "classic",
  })
  public paintball(context: CommandContext) {
    return this.run(context, PAINTBALL_MODES, (base) => <PaintballProfile {...base} />);
  }

  @SubCommand({
    description: (t) => t("commands.historical-pit"),
    args,
  })
  public pit(context: CommandContext) {
    return this.run(context, PIT_MODES, (base) => <PitProfile {...base} />);
  }

  @SubCommand({
    description: (t) => t("commands.historical-quake"),
    args,
    group: "classic",
  })
  public quake(context: CommandContext) {
    return this.run(context, QUAKE_MODES, (base, mode) => (
      <QuakeProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({ description: (t) => t("commands.historical-skywars"), args })
  public skywars(context: CommandContext) {
    return this.run(context, SKYWARS_MODES, (base, mode) => (
      <SkyWarsProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({ description: (t) => t("commands.historical-smashheroes"), args })
  public smashheroes(context: CommandContext) {
    return this.run(context, SMASH_HEROES_MODES, (base, mode) => (
      <SmashHeroesProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({ description: (t) => t("commands.historical-speeduhc"), args })
  public speeduhc(context: CommandContext) {
    return this.run(context, SPEED_UHC_MODES, (base, mode) => (
      <SpeedUHCProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({ description: (t) => t("commands.historical-tntgames"), args })
  public tntgames(context: CommandContext) {
    return this.run(context, TNT_GAMES_MODES, (base) => <TNTGamesProfile {...base} />);
  }

  @SubCommand({
    description: (t) => t("commands.historical-turbokartracers"),
    args,
    group: "classic",
  })
  public turbokartracers(context: CommandContext) {
    return this.run(context, TURBO_KART_RACERS_MODES, (base) => (
      <TurboKartRacersProfile {...base} />
    ));
  }

  @SubCommand({ description: (t) => t("commands.historical-uhc"), args })
  public uhc(context: CommandContext) {
    return this.run(context, UHC_MODES, (base, mode) => (
      <UHCProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({
    description: (t) => t("commands.historical-vampirez"),
    args,
    group: "classic",
  })
  public vampirez(context: CommandContext) {
    return this.run(context, VAMPIREZ_MODES, (base, mode) => (
      <VampireZProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({
    description: (t) => t("commands.historical-walls"),
    args,
    group: "classic",
  })
  public walls(context: CommandContext) {
    return this.run(context, WALLS_MODES, (base) => <WallsProfile {...base} />);
  }

  @SubCommand({ description: (t) => t("commands.historical-warlords"), args })
  public warlords(context: CommandContext) {
    return this.run(context, WARLORDS_MODES, (base, mode) => (
      <WarlordsProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({ description: (t) => t("commands.historical-woolwars"), args })
  public woolwars(context: CommandContext) {
    return this.run(context, WOOLWARS_MODES, (base, mode) => (
      <WoolWarsProfile {...base} mode={mode} />
    ));
  }

  private async run<T extends GamesWithBackgrounds>(
    context: CommandContext,
    modes: GameModes<T>,
    getProfile: (base: BaseProfileProps, mode: GameMode<T>) => JSX.Element,
    filterModes?: (player: Player, modes: GameMode<T>[]) => GameMode<T>[]
  ) {
    const user = context.getUser();

    const player = await this.apiService.getPlayerHistorical(
      context.option("player"),
      this.time,
      user
    );

    const [logo, skin, badge] = await Promise.all([
      getLogo(user),
      this.apiService.getPlayerSkin(player.uuid),
      this.apiService.getUserBadge(player.uuid),
    ]);

    const allModes = modes.getModes();
    const displayedModes = filterModes ? filterModes(player, allModes) : allModes;

    const isNotLastHistorical = [
      HistoricalTimes.DAILY as HistoricalType,
      HistoricalTimes.WEEKLY as HistoricalType,
      HistoricalTimes.MONTHLY as HistoricalType,
    ].includes(this.time);

    const pages: Page[] = displayedModes.map((mode) => ({
      label: mode.formatted,
      generator: async (t) => {
        const background = await getBackground(...mapBackground(modes, mode.api));

        let content = player.isNew
          ? `${t("historical.new", {
              displayName: this.apiService.emojiDisplayName(t, player.displayName),
            })}\n`
          : undefined;

        //TODO Modify this to use the player.nextReset key
        if (isNotLastHistorical)
          content =
            (content ?? "") + t("historical.reset", { time: this.getResetTime(player) });

        //TODO Remove this when the implementation is completed
        content += `\nLast Reset: ${player.lastReset}\nNext Reset:${
          player.nextReset
        } (${this.getResetTime(player)})`;

        const profile = getProfile(
          {
            player,
            skin,
            background,
            logo,
            t,
            user,
            badge,
            time: this.time,
          },
          mode
        );

        const canvas = render(profile, getTheme(user));
        const buffer = await canvas.toBuffer("png");

        return {
          content,
          files: [{ name: `${this.time}.png`, data: buffer, type: "image/png" }],
          attachments: [],
        };
      },
    }));

    return this.paginateService.paginate(context, pages);
  }

  //TODO Remove this when the implementation is completed
  private getResetTime(player: Player) {
    const now = DateTime.now();

    const hasResetToday = player.resetMinute! <= now.hour * 60 + now.minute;

    let resetTime = now
      .minus({ hours: now.hour, minutes: now.minute })
      .plus({ minutes: player.resetMinute! });

    const isSunday = now.weekday === 7;
    const isStartOfMonth = now.day === 1;

    if (this.time === HistoricalTimes.DAILY && hasResetToday) {
      resetTime = resetTime.plus({ days: 1 });
    } else if (
      this.time === HistoricalTimes.WEEKLY &&
      ((isSunday && hasResetToday) || !isSunday)
    ) {
      resetTime = resetTime.plus({ week: 1 }).minus({ days: isSunday ? 0 : now.weekday });
    } else if (
      this.time === HistoricalTimes.MONTHLY &&
      ((isStartOfMonth && hasResetToday) || !isStartOfMonth)
    ) {
      resetTime = resetTime.minus({ days: now.day - 1 }).plus({ months: 1 });
    }

    return Math.round(resetTime.toMillis() / 1000);
  }
}
