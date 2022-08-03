/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import {
  ArcadeChallenges,
  ArenaChallenges,
  BedwarsChallenges,
  BlitzChallenges,
  BuildBattleChallenges,
  CopsAndCrimsChallenges,
  DuelsChallenges,
  MegaWallsChallenges,
  MurderMysteryChallenges,
  PaintballChallenges,
  QuakeChallenges,
  SkywarsChallenges,
  SmashChallenges,
  TNTGamesChallenges,
  TurboKartRacersChallenges,
  UHCChallenges,
  VampireZChallenges,
  WallsChallenges,
  WarlordsChallenges,
  WoolWarsChallanges,
} from "./modes";
import { Field } from "../../metadata";
import { FormattedGame, GameModes, IGameModes } from "../../game";
import { SpeedUHCChallenges } from "./modes/speeduhc";

export const CHALLENGE_MODES = new GameModes([
  { api: "overall" },
  { api: "ARCADE" },
  { api: "ARENA_BRAWL" },
  { api: "BEDWARS" },
  { api: "BLITZSG" },
  { api: "BUILD_BATTLE" },
  { api: "DUELS" },
  { api: "COPS_AND_CRIMS" },
  { api: "MEGA_WALLS" },
  { api: "MURDER_MYSTERY" },
  { api: "PAINTBALL" },
  { api: "QUAKE" },
  { api: "SKYWARS" },
  { api: "SMASH_HEROS" },
  { api: "SPEED_UHC" },
  { api: "TNT_GAMES" },
  { api: "TURBO_KART_RACERS" },
  { api: "UHC" },
  { api: "VAMPIREZ" },
  { api: "WALLS" },
  { api: "WARLORDS" },
  { api: "WOOLWARS" },
]);

export type ChallengeModes = IGameModes<typeof CHALLENGE_MODES>;

export class Challenges {
  @Field({ leaderboard: { fieldName: `${FormattedGame.ARCADE} Challenges` } })
  public ARCADE: ArcadeChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.ARENA_BRAWL} Challenges` } })
  public ARENA_BRAWL: ArenaChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.BEDWARS} Challenges` } })
  public BEDWARS: BedwarsChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.BLITZSG} Challenges` } })
  public BLITZSG: BlitzChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.BUILD_BATTLE} Challenges` } })
  public BUILD_BATTLE: BuildBattleChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.DUELS} Challenges` } })
  public DUELS: DuelsChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.COPS_AND_CRIMS} Challenges` } })
  public COPS_AND_CRIMS: CopsAndCrimsChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.MURDER_MYSTERY} Challenges` } })
  public MEGAWALLS: MegaWallsChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.MURDER_MYSTERY} Challenges` } })
  public MURDER_MYSTERY: MurderMysteryChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.PAINTBALL} Challenges` } })
  public PAINTBALL: PaintballChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.QUAKE} Challenges` } })
  public QUAKE: QuakeChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.SKYWARS} Challenges` } })
  public SKYWARS: SkywarsChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.SMASH_HEROES} Challenges` } })
  public SMASH_HEROES: SmashChallenges;

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
  public WOOLWARS: WoolWarsChallanges;

  public constructor(challenges: APIData) {
    this.ARCADE = new ArcadeChallenges(challenges);
    this.ARENA_BRAWL = new ArenaChallenges(challenges);
    this.BEDWARS = new BedwarsChallenges(challenges);
    this.BLITZSG = new BlitzChallenges(challenges);
    this.BUILD_BATTLE = new BuildBattleChallenges(challenges);
    this.DUELS = new DuelsChallenges(challenges);
    this.COPS_AND_CRIMS = new CopsAndCrimsChallenges(challenges);
    this.MEGA_WALLS = new MegaWallsChallenges(challenges);
    this.MURDER_MYSTERY = new MurderMysteryChallenges(challenges);
    this.PAINTBALL = new PaintballChallenges(challenges);
    this.QUAKE = new QuakeChallenges(challenges);
    this.SKYWARS = new SkywarsChallenges(challenges);
    this.SMASH_HEROS = new SmashChallenges(challenges);
    this.SPEED_UHC = new SpeedUHCChallenges(challenges);
    this.TNT_GAMES = new TNTGamesChallenges(challenges);
    this.TURBO_KART_RACERS = new TurboKartRacersChallenges(challenges);
    this.UHC = new UHCChallenges(challenges);
    this.VAMPIREZ = new VampireZChallenges(challenges);
    this.WALLS = new WallsChallenges(challenges);
    this.WARLORDS = new WarlordsChallenges(challenges);
    this.WOOLWARS = new WoolWarsChallanges(challenges);
  }
}
