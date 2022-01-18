import type { APIData } from '@statsify/util';
import { Field } from '../decorators';
import { Arcade } from './gamemodes/arcade';
import { ArenaBrawl } from './gamemodes/arenabrawl';
import { BedWars } from './gamemodes/bedwars';
import { BlitzSG } from './gamemodes/blitzsg';
import { BuildBattle } from './gamemodes/buildbattle';
import { CopsAndCrims } from './gamemodes/copsandcrims';
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

export class PlayerStats {
  @Field()
  public arcade: Arcade;

  @Field()
  public arenabrawl: ArenaBrawl;

  @Field()
  public bedwars: BedWars;

  @Field()
  public blitzsg: BlitzSG;

  @Field()
  public buildbattle: BuildBattle;

  @Field()
  public copsandcrims: CopsAndCrims;

  @Field()
  public general: General;

  @Field()
  public megawalls: MegaWalls;

  @Field()
  public murdermystery: MurderMystery;

  @Field()
  public paintball: Paintball;

  @Field()
  public parkour: Parkour;

  @Field()
  public quake: Quake;

  @Field()
  public skywars: SkyWars;

  @Field()
  public smashheroes: SmashHeroes;

  @Field()
  public speeduhc: SpeedUHC;

  @Field()
  public tntgames: TNTGames;

  @Field()
  public turbokartracers: TurboKartRacers;

  @Field()
  public uhc: UHC;

  @Field()
  public vampirez: VampireZ;

  @Field()
  public walls: Walls;

  @Field()
  public warlords: Warlords;
  public constructor(data: APIData = {}) {
    this.arcade = new Arcade(data?.stats?.Arcade ?? {}, data?.achievements ?? {});
    this.arenabrawl = new ArenaBrawl(data?.stats?.Arena ?? {});
    this.bedwars = new BedWars(data?.stats?.Bedwars ?? {});
    this.blitzsg = new BlitzSG(data?.stats?.HungerGames ?? {});
    this.buildbattle = new BuildBattle(data?.stats?.BuildBattle ?? {});
    this.copsandcrims = new CopsAndCrims(data?.stats?.MCGO ?? {});
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
  }
}
