/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { APIData } from "@statsify/util";
import {
  ArenaChallenges,
  BedwarsChallenges,
  BlitzChallenges,
  BuildBattleChallenges,
  CopsAndCrimsChallenges,
  DuelsChallenges,
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
  { api: "arcade" },
  { api: "arena" },
  { api: "bedwars" },
  { api: "blitzsg" },
  { api: "buildbattle" },
  { api: "duels" },
  { api: "copsAndCrims" },
  { api: "murdermystery" },
  { api: "paintball" },
  { api: "quake" },
  { api: "skyclash" },
  { api: "skywars" },
  { api: "smashheros" },
]);

export type ChallengeModes = IGameModes<typeof CHALLENGE_MODES>;

export class Challenges {
  @Field({ leaderboard: { fieldName: `${FormattedGame.ARCADE} Challenges` } })
  public arcade: SmashChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.ARENA_BRAWL} Challenges` } })
  public arena: ArenaChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.BEDWARS} Challenges` } })
  public bedwars: BedwarsChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.BLITZSG} Challenges` } })
  public blitzsg: BlitzChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.BUILD_BATTLE} Challenges` } })
  public buildbattle: BuildBattleChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.DUELS} Challenges` } })
  public duels: DuelsChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.COPS_AND_CRIMS} Challenges` } })
  public copsAndCrims: CopsAndCrimsChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.MURDER_MYSTERY} Challenges` } })
  public murdermystery: MurderMysteryChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.PAINTBALL} Challenges` } })
  public paintball: PaintballChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.QUAKE} Challenges` } })
  public quake: QuakeChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.SKYWARS} Challenges` } })
  public skywars: SkywarsChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.SMASH_HEROES} Challenges` } })
  public smashheros: SmashChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.SPEED_UHC} Challenges` } })
  public speeduhc: SpeedUHCChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.TNT_GAMES} Challenges` } })
  public tntgames: TNTGamesChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.TURBO_KART_RACERS} Challenges` } })
  public turbokartracers: TurboKartRacersChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.UHC} Challenges` } })
  public uhc: UHCChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.VAMPIREZ} Challenges` } })
  public vampirez: VampireZChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.WALLS} Challenges` } })
  public walls: WallsChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.WARLORDS} Challenges` } })
  public warlords: WarlordsChallenges;

  @Field({ leaderboard: { fieldName: `${FormattedGame.WOOLWARS} Challenges` } })
  public woolwars: WoolWarsChallanges;

  public constructor(challenges: APIData) {
    this.arcade = new SmashChallenges(challenges);
    this.arena = new ArenaChallenges(challenges);
    this.bedwars = new BedwarsChallenges(challenges);
    this.blitzsg = new BlitzChallenges(challenges);
    this.buildbattle = new BuildBattleChallenges(challenges);
    this.duels = new DuelsChallenges(challenges);
    this.copsAndCrims = new CopsAndCrimsChallenges(challenges);
    this.murdermystery = new MurderMysteryChallenges(challenges);
    this.paintball = new PaintballChallenges(challenges);
    this.quake = new QuakeChallenges(challenges);
    this.skywars = new SkywarsChallenges(challenges);
    this.smashheros = new SmashChallenges(challenges);
    this.speeduhc = new SpeedUHCChallenges(challenges);
    this.tntgames = new TNTGamesChallenges(challenges);
    this.turbokartracers = new TurboKartRacersChallenges(challenges);
    this.uhc = new UHCChallenges(challenges);
    this.vampirez = new VampireZChallenges(challenges);
    this.walls = new WallsChallenges(challenges);
    this.warlords = new WarlordsChallenges(challenges);
    this.woolwars = new WoolWarsChallanges(challenges);
  }
}
