/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type APIData, removeFormatting } from "@statsify/util";
import {
  ArcadeChallenges,
  ArenaBrawlChallenges,
  BedWarsChallenges,
  BlitzSGChallenges,
  BuildBattleChallenges,
  CopsAndCrimsChallenges,
  DuelsChallenges,
  MegaWallsChallenges,
  MurderMysteryChallenges,
  PaintballChallenges,
  QuakeChallenges,
  SkyWarsChallenges,
  SmashHeroesChallenges,
  SpeedUHCChallenges,
  TNTGamesChallenges,
  TurboKartRacersChallenges,
  UHCChallenges,
  VampireZChallenges,
  WallsChallenges,
  WarlordsChallenges,
  WoolGamesChallenges,
} from "./modes/index.js";
import { ExtractGameModes, FormattedGame, GameModes } from "#game";
import { Field } from "#metadata";


export class Challenges {
  @Field({ leaderboard: { fieldName: `${FormattedGame.ARCADE} Challenges -` } })
  public ARCADE: ArcadeChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.ARENA_BRAWL} Challenges -` } })
  public ARENA_BRAWL: ArenaBrawlChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.BEDWARS} Challenges -` } })
  public BEDWARS: BedWarsChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.BLITZSG} Challenges -` } })
  public BLITZSG: BlitzSGChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.BUILD_BATTLE} Challenges -` } })
  public BUILD_BATTLE: BuildBattleChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.COPS_AND_CRIMS} Challenges -` } })
  public COPS_AND_CRIMS: CopsAndCrimsChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.DUELS} Challenges -` } })
  public DUELS: DuelsChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.MEGAWALLS} Challenges -` } })
  public MEGAWALLS: MegaWallsChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.MURDER_MYSTERY} Challenges -` } })
  public MURDER_MYSTERY: MurderMysteryChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.PAINTBALL} Challenges -` } })
  public PAINTBALL: PaintballChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.QUAKE} Challenges -` } })
  public QUAKE: QuakeChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.SKYWARS} Challenges -` } })
  public SKYWARS: SkyWarsChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.SMASH_HEROES} Challenges -` } })
  public SMASH_HEROES: SmashHeroesChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.SPEED_UHC} Challenges -` } })
  public SPEED_UHC: SpeedUHCChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.TNT_GAMES} Challenges -` } })
  public TNT_GAMES: TNTGamesChallenges;

  @Field({
    leaderboard: { fieldName: `${FormattedGame.TURBO_KART_RACERS} Challenges -` },
  })
  public TURBO_KART_RACERS: TurboKartRacersChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.UHC} Challenges -` } })
  public UHC: UHCChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.VAMPIREZ} Challenges -` } })
  public VAMPIREZ: VampireZChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.WALLS} Challenges -` } })
  public WALLS: WallsChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.WARLORDS} Challenges -` } })
  public WARLORDS: WarlordsChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.WOOLGAMES} Challenges -` } })
  public WOOLGAMES: WoolGamesChallenges;

  @Field({ leaderboard: { name: "Total Challenges", fieldName: "Challenges" } })
  public total: number;

  public constructor(challenges: APIData, ap: APIData) {
    this.ARCADE = new ArcadeChallenges(challenges);
    this.ARENA_BRAWL = new ArenaBrawlChallenges(challenges);
    this.BEDWARS = new BedWarsChallenges(challenges);
    this.BLITZSG = new BlitzSGChallenges(challenges);
    this.BUILD_BATTLE = new BuildBattleChallenges(challenges);
    this.COPS_AND_CRIMS = new CopsAndCrimsChallenges(challenges);
    this.DUELS = new DuelsChallenges(challenges);
    this.MEGAWALLS = new MegaWallsChallenges(challenges);
    this.MURDER_MYSTERY = new MurderMysteryChallenges(challenges);
    this.PAINTBALL = new PaintballChallenges(challenges);
    this.QUAKE = new QuakeChallenges(challenges);
    this.SKYWARS = new SkyWarsChallenges(challenges);
    this.SMASH_HEROES = new SmashHeroesChallenges(challenges);
    this.SPEED_UHC = new SpeedUHCChallenges(challenges);
    this.TNT_GAMES = new TNTGamesChallenges(challenges);
    this.TURBO_KART_RACERS = new TurboKartRacersChallenges(challenges);
    this.UHC = new UHCChallenges(challenges);
    this.VAMPIREZ = new VampireZChallenges(challenges);
    this.WALLS = new WallsChallenges(challenges);
    this.WARLORDS = new WarlordsChallenges(challenges);
    this.WOOLGAMES = new WoolGamesChallenges(challenges);

    this.total = Math.max(
      Object.values(challenges ?? {}).reduce((p, c) => p + c, 0),
      ap.general_challenger ?? 0
    );
  }
}

export * from "./game-challenges.js";
export * from "./modes/index.js";
