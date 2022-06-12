import type { APIData } from '@statsify/util';
import { Field } from '../metadata';
import { Arcade } from './gamemodes/arcade';
import { ArenaBrawl } from './gamemodes/arenabrawl';
import { BedWars } from './gamemodes/bedwars';
import { BlitzSG } from './gamemodes/blitzsg';
import { BuildBattle } from './gamemodes/buildbattle';
import { CopsAndCrims } from './gamemodes/copsandcrims';
import { Duels } from './gamemodes/duels';
import { General } from './gamemodes/general';
import { MegaWalls } from './gamemodes/megawalls';
import { MurderMystery } from './gamemodes/murdermystery';
import { Paintball } from './gamemodes/paintball';
import { Parkour } from './gamemodes/parkour';
import { Quake } from './gamemodes/quake';
import { SkyWars } from './gamemodes/skywars';
import { SmashHeroes } from './gamemodes/smashheroes';
import { SpeedUHC } from './gamemodes/speeduhc';
import { TNTGames } from './gamemodes/tntgames';
import { TurboKartRacers } from './gamemodes/turbokartracers';
import { UHC } from './gamemodes/uhc';
import { VampireZ } from './gamemodes/vampirez';
import { Walls } from './gamemodes/walls';
import { Warlords } from './gamemodes/warlords';
import { WoolWars } from './gamemodes/woolwars';

export class PlayerStats {
  @Field({ leaderboard: { fieldName: 'Arcade -' } })
  public arcade: Arcade;

  @Field({ leaderboard: { fieldName: 'ArenaBrawl' } })
  public arenabrawl: ArenaBrawl;

  @Field({ leaderboard: { fieldName: 'BedWars', extraDisplay: 'stats.bedwars.levelFormatted' } })
  public bedwars: BedWars;

  @Field({ leaderboard: { fieldName: 'BlitzSG' } })
  public blitzsg: BlitzSG;

  @Field({
    leaderboard: { fieldName: 'Build Battle', extraDisplay: 'stats.buildbattle.titleFormatted' },
  })
  public buildbattle: BuildBattle;

  @Field({ leaderboard: { fieldName: 'Cops And Crims' } })
  public copsandcrims: CopsAndCrims;

  @Field({ leaderboard: { fieldName: 'Duels -' } })
  public duels: Duels;

  @Field({ leaderboard: { fieldName: 'General -' } })
  public general: General;

  @Field({ leaderboard: { fieldName: 'MegaWalls' } })
  public megawalls: MegaWalls;

  @Field({ leaderboard: { fieldName: 'Murder Mystery' } })
  public murdermystery: MurderMystery;

  @Field({ leaderboard: { fieldName: 'Paintball' } })
  public paintball: Paintball;

  @Field({ leaderboard: { fieldName: 'Parkour -' } })
  public parkour: Parkour;

  @Field({ leaderboard: { fieldName: 'Quake' } })
  public quake: Quake;

  @Field({ leaderboard: { fieldName: 'SkyWars', extraDisplay: 'stats.skywars.levelFormatted' } })
  public skywars: SkyWars;

  @Field({
    leaderboard: { fieldName: 'Smash Heroes', extraDisplay: 'stats.smashheroes.levelFormatted' },
  })
  public smashheroes: SmashHeroes;

  @Field({ leaderboard: { fieldName: 'SpeedUHC', extraDisplay: 'stats.speeduhc.levelFormatted' } })
  public speeduhc: SpeedUHC;

  @Field({ leaderboard: { fieldName: 'TNT Games' } })
  public tntgames: TNTGames;

  @Field({ leaderboard: { fieldName: 'Turbo Kart Racers' } })
  public turbokartracers: TurboKartRacers;

  @Field({ leaderboard: { fieldName: 'UHC', extraDisplay: 'stats.uhc.levelFormatted' } })
  public uhc: UHC;

  @Field({ leaderboard: { fieldName: 'VampireZ' } })
  public vampirez: VampireZ;

  @Field({ leaderboard: { fieldName: 'Walls' } })
  public walls: Walls;

  @Field({ leaderboard: { fieldName: 'Warlords' } })
  public warlords: Warlords;

  @Field({ leaderboard: { fieldName: 'WoolWars', extraDisplay: 'stats.woolwars.levelFormatted' } })
  public woolwars: WoolWars;

  public constructor(data: APIData = {}) {
    this.arcade = new Arcade(data?.stats?.Arcade ?? {}, data?.achievements ?? {});
    this.arenabrawl = new ArenaBrawl(data?.stats?.Arena ?? {});
    this.bedwars = new BedWars(data?.stats?.Bedwars ?? {});
    this.blitzsg = new BlitzSG(data?.stats?.HungerGames ?? {});
    this.buildbattle = new BuildBattle(data?.stats?.BuildBattle ?? {});
    this.copsandcrims = new CopsAndCrims(data?.stats?.MCGO ?? {});
    this.duels = new Duels(data?.stats?.Duels ?? {});
    this.general = new General(data);
    this.megawalls = new MegaWalls(data?.stats?.Walls3 ?? {});
    this.murdermystery = new MurderMystery(
      data?.stats?.MurderMystery ?? {},
      data?.achievements ?? {}
    );
    this.paintball = new Paintball(data?.stats?.Paintball ?? {});
    this.parkour = new Parkour(data?.parkourCompletions ?? {});
    this.quake = new Quake(data?.stats?.Quake ?? {}, data?.achievements ?? {});
    this.skywars = new SkyWars(data?.stats?.SkyWars ?? {});
    this.smashheroes = new SmashHeroes(data?.stats?.SuperSmash ?? {});
    this.speeduhc = new SpeedUHC(data?.stats?.SpeedUHC ?? {});
    this.tntgames = new TNTGames(data?.stats?.TNTGames ?? {}, data?.achievements ?? {});
    this.turbokartracers = new TurboKartRacers(data?.stats?.GingerBread ?? {});
    this.uhc = new UHC(data?.stats?.UHC ?? {});
    this.vampirez = new VampireZ(data?.stats?.VampireZ ?? {});
    this.walls = new Walls(data?.stats?.Walls ?? {});
    this.warlords = new Warlords(data?.stats?.Battleground ?? {});
    this.woolwars = new WoolWars(data?.stats?.WoolGames ?? {});
  }
}
