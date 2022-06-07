import { PlayerArgument } from '#arguments';
import { GamesWithBackgrounds, mapBackground } from '#constants';
import { ApiService, Page, PaginateService } from '#services';
import { HistoricalType } from '@statsify/api-client';
import { getBackground, getLogo } from '@statsify/assets';
import { Command, CommandContext, SubCommand } from '@statsify/discord';
import { render } from '@statsify/rendering';
import {
  ARCADE_MODES,
  BEDWARS_MODES,
  BLITZSG_MODES,
  BUILD_BATTLE_MODES,
  COPS_AND_CRIMS_MODES,
  DUELS_MODES,
  GENERAL_MODES,
  MEGAWALLS_MODES,
  MURDER_MYSTERY_MODES,
  PAINTBALL_MODES,
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
} from '@statsify/schemas';
import { prettify } from '@statsify/util';
import Container from 'typedi';
import { getTheme } from '../../themes';
import { ArcadeProfile } from '../arcade/arcade.profile';
import type { BaseProfileProps } from '../base.hypixel-command';
import { BedWarsProfile } from '../bedwars/bedwars.profile';
import { BlitzSGProfile } from '../blitzsg/blitzsg.profile';
import { BuildBattleProfile } from '../buildbattle/buildbattle.profile';
import { CopsAndCrimsProfile } from '../copsandcrims/copsandcrims.profile';
import { DuelsProfile } from '../duels/duels.profile';
import { GeneralProfile } from '../general/general.profile';
import { MegaWallsProfile } from '../megawalls/megawalls.profile';
import { MurderMysteryProfile } from '../murdermystery/murdermystery.profile';
import { PaintballProfile } from '../paintball/paintball.profile';
import { QuakeProfile } from '../quake/quake.profile';
import { SkyWarsProfile } from '../skywars/skywars.profile';
import { SmashHeroesProfile } from '../smashheroes/smashheroes.profile';
import { SpeedUHCProfile } from '../speeduhc/speeduhc.profile';
import { TNTGamesProfile } from '../tntgames/tntgames.profile';
import { TurboKartRacersProfile } from '../turbokartracers/turbokartracers.profile';
import { UHCProfile } from '../uhc/uhc.profile';
import { VampireZProfile } from '../vampirez/vampirez.profile';
import { WallsProfile } from '../walls/walls.profile';
import { WarlordsProfile } from '../warlords/warlords.profile';
import { WoolWarsProfile } from '../woolwars/woolwars.profile';

const args = [PlayerArgument];

@Command({ description: '' })
export class HistoricalBase {
  private readonly apiService: ApiService;
  private readonly paginateService: PaginateService;

  public constructor(private readonly time: HistoricalType) {
    this.apiService = Container.get(ApiService);
    this.paginateService = Container.get(PaginateService);
  }

  @SubCommand({ description: (t) => t('commands.arcade'), args })
  public arcade(context: CommandContext) {
    return this.run(context, ARCADE_MODES, (base, mode) => <ArcadeProfile {...base} mode={mode} />);
  }

  @SubCommand({ description: (t) => t('commands.arenabrawl'), args })
  public arenabrawl(context: CommandContext) {
    return this.run(context, BEDWARS_MODES, (base, mode) => (
      <BedWarsProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({ description: (t) => t('commands.bedwars'), args })
  public bedwars(context: CommandContext) {
    return this.run(context, BEDWARS_MODES, (base, mode) => (
      <BedWarsProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({ description: (t) => t('commands.blitzsg'), args })
  public blitzsg(context: CommandContext) {
    return this.run(context, BLITZSG_MODES, (base, mode) => (
      <BlitzSGProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({ description: (t) => t('commands.buildbattle'), args })
  public buildbattle(context: CommandContext) {
    return this.run(context, BUILD_BATTLE_MODES, (base) => <BuildBattleProfile {...base} />);
  }

  @SubCommand({ description: (t) => t('commands.copsandcrims'), args })
  public copsandcrims(context: CommandContext) {
    return this.run(context, COPS_AND_CRIMS_MODES, (base, mode) => (
      <CopsAndCrimsProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({ description: (t) => t('commands.duels'), args })
  public duels(context: CommandContext) {
    return this.run(context, DUELS_MODES, (base, mode) => <DuelsProfile {...base} mode={mode} />);
  }

  @SubCommand({ description: (t) => t('commands.general'), args })
  public general(context: CommandContext) {
    return this.run(context, GENERAL_MODES, (base) => <GeneralProfile {...base} />);
  }

  @SubCommand({ description: (t) => t('commands.megawalls'), args })
  public megawalls(context: CommandContext) {
    return this.run(context, MEGAWALLS_MODES, (base, mode) => (
      <MegaWallsProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({ description: (t) => t('commands.murdermystery'), args })
  public murdermystery(context: CommandContext) {
    return this.run(context, MURDER_MYSTERY_MODES, (base) => <MurderMysteryProfile {...base} />);
  }

  @SubCommand({ description: (t) => t('commands.paintball'), args })
  public paintball(context: CommandContext) {
    return this.run(context, PAINTBALL_MODES, (base) => <PaintballProfile {...base} />);
  }

  @SubCommand({ description: (t) => t('commands.quake'), args })
  public quake(context: CommandContext) {
    return this.run(context, QUAKE_MODES, (base, mode) => <QuakeProfile {...base} mode={mode} />);
  }

  @SubCommand({ description: (t) => t('commands.skywars'), args })
  public skywars(context: CommandContext) {
    return this.run(context, SKYWARS_MODES, (base, mode) => (
      <SkyWarsProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({ description: (t) => t('commands.smashheroes'), args })
  public smashheroes(context: CommandContext) {
    return this.run(context, SMASH_HEROES_MODES, (base, mode) => (
      <SmashHeroesProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({ description: (t) => t('commands.speeduhc'), args })
  public speeduhc(context: CommandContext) {
    return this.run(context, SPEED_UHC_MODES, (base, mode) => (
      <SpeedUHCProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({ description: (t) => t('commands.tntgames'), args })
  public tntgames(context: CommandContext) {
    return this.run(context, TNT_GAMES_MODES, (base) => <TNTGamesProfile {...base} />);
  }

  @SubCommand({ description: (t) => t('commands.turbokartracers'), args })
  public turbokartracers(context: CommandContext) {
    return this.run(context, TURBO_KART_RACERS_MODES, (base) => (
      <TurboKartRacersProfile {...base} />
    ));
  }

  @SubCommand({ description: (t) => t('commands.uhc'), args })
  public uhc(context: CommandContext) {
    return this.run(context, UHC_MODES, (base, mode) => <UHCProfile {...base} mode={mode} />);
  }

  @SubCommand({ description: (t) => t('commands.vampirez'), args })
  public vampirez(context: CommandContext) {
    return this.run(context, VAMPIREZ_MODES, (base) => <VampireZProfile {...base} />);
  }

  @SubCommand({ description: (t) => t('commands.walls'), args })
  public walls(context: CommandContext) {
    return this.run(context, WALLS_MODES, (base) => <WallsProfile {...base} />);
  }

  @SubCommand({ description: (t) => t('commands.warlords'), args })
  public warlords(context: CommandContext) {
    return this.run(context, WARLORDS_MODES, (base, mode) => (
      <WarlordsProfile {...base} mode={mode} />
    ));
  }

  @SubCommand({ description: (t) => t('commands.woolwars'), args })
  public woolwars(context: CommandContext) {
    return this.run(context, WOOL_WARS_MODES, (base, mode) => (
      <WoolWarsProfile {...base} mode={mode} />
    ));
  }

  private async run<T extends GamesWithBackgrounds>(
    context: CommandContext,
    modes: T,
    getProfile: (base: BaseProfileProps, mode: T[number]) => JSX.Element
  ) {
    const user = context.getUser();

    const player = await this.apiService.getWithUser(
      user,
      this.apiService.getPlayerHistorical,
      context.option('player'),
      this.time
    );

    const [logo, skin] = await Promise.all([
      getLogo(user?.premium),
      this.apiService.getPlayerSkin(player.uuid),
    ]);

    const pages: Page[] = modes.map((mode) => ({
      label: prettify(mode),
      generator: async (t) => {
        const background = await getBackground(...mapBackground(modes, mode as T[number]));

        const profile = getProfile(
          {
            player,
            skin,
            background,
            logo,
            t,
            premium: user?.premium,
            badge: player.user?.badge,
            time: this.time,
          },
          mode
        );

        return render(profile, getTheme(user?.theme));
      },
    }));

    return this.paginateService.paginate(context, pages);
  }
}
