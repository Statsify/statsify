/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { APIData } from '@statsify/util';
import { FormattedGame } from '../game';
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
  @Field({ leaderboard: { fieldName: `${FormattedGame.ARCADE} -` } })
  public arcade: Arcade;

  @Field({ leaderboard: { fieldName: FormattedGame.ARENA_BRAWL } })
  public arenabrawl: ArenaBrawl;

  @Field({
    leaderboard: { fieldName: FormattedGame.BEDWARS, extraDisplay: 'stats.bedwars.levelFormatted' },
  })
  public bedwars: BedWars;

  @Field({ leaderboard: { fieldName: FormattedGame.BLITZSG } })
  public blitzsg: BlitzSG;

  @Field({
    leaderboard: {
      fieldName: FormattedGame.BUILD_BATTLE,
      extraDisplay: 'stats.buildbattle.titleFormatted',
    },
  })
  public buildbattle: BuildBattle;

  @Field({ leaderboard: { fieldName: FormattedGame.COPS_AND_CRIMS } })
  public copsandcrims: CopsAndCrims;

  @Field({ leaderboard: { fieldName: `${FormattedGame.DUELS} -` } })
  public duels: Duels;

  @Field({ leaderboard: { fieldName: `${FormattedGame.GENERAL} -` } })
  public general: General;

  @Field({ leaderboard: { fieldName: FormattedGame.MEGAWALLS } })
  public megawalls: MegaWalls;

  @Field({ leaderboard: { fieldName: FormattedGame.MURDER_MYSTERY } })
  public murdermystery: MurderMystery;

  @Field({ leaderboard: { fieldName: FormattedGame.PAINTBALL } })
  public paintball: Paintball;

  @Field({ leaderboard: { fieldName: `${FormattedGame.PARKOUR} -` } })
  public parkour: Parkour;

  @Field({ leaderboard: { fieldName: FormattedGame.QUAKE } })
  public quake: Quake;

  @Field({
    leaderboard: { fieldName: FormattedGame.SKYWARS, extraDisplay: 'stats.skywars.levelFormatted' },
  })
  public skywars: SkyWars;

  @Field({
    leaderboard: {
      fieldName: FormattedGame.SMASH_HEROES,
      extraDisplay: 'stats.smashheroes.levelFormatted',
    },
  })
  public smashheroes: SmashHeroes;

  @Field({
    leaderboard: {
      fieldName: FormattedGame.SPEED_UHC,
      extraDisplay: 'stats.speeduhc.levelFormatted',
    },
  })
  public speeduhc: SpeedUHC;

  @Field({ leaderboard: { fieldName: FormattedGame.TNT_GAMES } })
  public tntgames: TNTGames;

  @Field({ leaderboard: { fieldName: FormattedGame.TURBO_KART_RACERS } })
  public turbokartracers: TurboKartRacers;

  @Field({
    leaderboard: { fieldName: FormattedGame.UHC, extraDisplay: 'stats.uhc.levelFormatted' },
  })
  public uhc: UHC;

  @Field({ leaderboard: { fieldName: FormattedGame.VAMPIREZ } })
  public vampirez: VampireZ;

  @Field({ leaderboard: { fieldName: FormattedGame.WALLS } })
  public walls: Walls;

  @Field({ leaderboard: { fieldName: FormattedGame.WARLORDS } })
  public warlords: Warlords;

  @Field({
    leaderboard: {
      fieldName: FormattedGame.WOOLWARS,
      extraDisplay: 'stats.woolwars.levelFormatted',
    },
  })
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
