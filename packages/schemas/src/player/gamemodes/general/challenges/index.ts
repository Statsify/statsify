/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData, removeFormatting } from "@statsify/util";
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
  WoolWarsChallenges,
} from "./modes";
import { Field } from "../../../../metadata";
import { FormattedGame, GameModes, IGameModes } from "../../../../game";

export const CHALLENGE_MODES = new GameModes([
  { api: "overall" },
  { api: "ARCADE", formatted: removeFormatting(FormattedGame.ARCADE) },
  { api: "ARENA_BRAWL", formatted: removeFormatting(FormattedGame.ARENA_BRAWL) },
  { api: "BEDWARS", formatted: removeFormatting(FormattedGame.BEDWARS) },
  { api: "BLITZSG", formatted: removeFormatting(FormattedGame.BLITZSG) },
  { api: "BUILD_BATTLE", formatted: removeFormatting(FormattedGame.BUILD_BATTLE) },
  { api: "DUELS", formatted: removeFormatting(FormattedGame.DUELS) },
  { api: "COPS_AND_CRIMS", formatted: removeFormatting(FormattedGame.COPS_AND_CRIMS) },
  { api: "MEGAWALLS", formatted: removeFormatting(FormattedGame.MEGAWALLS) },
  { api: "MURDER_MYSTERY", formatted: removeFormatting(FormattedGame.MURDER_MYSTERY) },
  { api: "PAINTBALL", formatted: removeFormatting(FormattedGame.PAINTBALL) },
  { api: "QUAKE", formatted: removeFormatting(FormattedGame.QUAKE) },
  { api: "SKYWARS", formatted: removeFormatting(FormattedGame.SKYWARS) },
  { api: "SMASH_HEROES", formatted: removeFormatting(FormattedGame.SMASH_HEROES) },
  { api: "SPEED_UHC", formatted: removeFormatting(FormattedGame.SPEED_UHC) },
  { api: "TNT_GAMES", formatted: removeFormatting(FormattedGame.TNT_GAMES) },
  {
    api: "TURBO_KART_RACERS",
    formatted: removeFormatting(FormattedGame.TURBO_KART_RACERS),
  },
  { api: "UHC", formatted: removeFormatting(FormattedGame.UHC) },
  { api: "VAMPIREZ", formatted: removeFormatting(FormattedGame.VAMPIREZ) },
  { api: "WALLS", formatted: removeFormatting(FormattedGame.WALLS) },
  { api: "WARLORDS", formatted: removeFormatting(FormattedGame.WARLORDS) },
  { api: "WOOLWARS", formatted: removeFormatting(FormattedGame.WOOLWARS) },
]);

export type ChallengeModes = IGameModes<typeof CHALLENGE_MODES>;

export class Challenges {
  @Field({ leaderboard: { fieldName: `${FormattedGame.ARCADE} Challenges` } })
  public ARCADE: ArcadeChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.ARENA_BRAWL} Challenges` } })
  public ARENA_BRAWL: ArenaBrawlChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.BEDWARS} Challenges` } })
  public BEDWARS: BedWarsChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.BLITZSG} Challenges` } })
  public BLITZSG: BlitzSGChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.BUILD_BATTLE} Challenges` } })
  public BUILD_BATTLE: BuildBattleChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.COPS_AND_CRIMS} Challenges` } })
  public COPS_AND_CRIMS: CopsAndCrimsChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.DUELS} Challenges` } })
  public DUELS: DuelsChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.MEGAWALLS} Challenges` } })
  public MEGAWALLS: MegaWallsChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.MURDER_MYSTERY} Challenges` } })
  public MURDER_MYSTERY: MurderMysteryChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.PAINTBALL} Challenges` } })
  public PAINTBALL: PaintballChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.QUAKE} Challenges` } })
  public QUAKE: QuakeChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.SKYWARS} Challenges` } })
  public SKYWARS: SkyWarsChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.SMASH_HEROES} Challenges` } })
  public SMASH_HEROES: SmashHeroesChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.SPEED_UHC} Challenges` } })
  public SPEED_UHC: SpeedUHCChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.TNT_GAMES} Challenges` } })
  public TNT_GAMES: TNTGamesChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.TURBO_KART_RACERS} Challenges` } })
  public TURBO_KART_RACERS: TurboKartRacersChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.UHC} Challenges` } })
  public UHC: UHCChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.VAMPIREZ} Challenges` } })
  public VAMPIREZ: VampireZChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.WALLS} Challenges` } })
  public WALLS: WallsChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.WARLORDS} Challenges` } })
  public WARLORDS: WarlordsChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.WOOLWARS} Challenges` } })
  public WOOLWARS: WoolWarsChallenges;

  @Field()
  public total: number;

  public constructor(challenges: APIData) {
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
    this.WOOLWARS = new WoolWarsChallenges(challenges);

    this.total = Object.entries(this).reduce(
      (p, c) => (c[1]?.total ? p + c[1].total : p),
      0
    );
  }
}

export * from "./game-challenges";
