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
import { Field } from "../../../metadata";
import { FormattedGame, GameModes } from "../../../game";
import {
  GameType,
  GetMetadataModes,
  Mode,
  StatsifyApiModes,
} from "../../../metadata/GameType";

@GameType("overall")
export class Challenges {
  @Mode("", removeFormatting(FormattedGame.ARCADE))
  @Field({ leaderboard: { fieldName: `${FormattedGame.ARCADE} Challenges -` } })
  public ARCADE: ArcadeChallenges;

  @Mode("", removeFormatting(FormattedGame.ARENA_BRAWL))
  @Field({ leaderboard: { fieldName: `${FormattedGame.ARENA_BRAWL} Challenges -` } })
  public ARENA_BRAWL: ArenaBrawlChallenges;

  @Mode("", removeFormatting(FormattedGame.BEDWARS))
  @Field({ leaderboard: { fieldName: `${FormattedGame.BEDWARS} Challenges -` } })
  public BEDWARS: BedWarsChallenges;

  @Mode("", removeFormatting(FormattedGame.BLITZSG))
  @Field({ leaderboard: { fieldName: `${FormattedGame.BLITZSG} Challenges -` } })
  public BLITZSG: BlitzSGChallenges;

  @Mode("", removeFormatting(FormattedGame.BUILD_BATTLE))
  @Field({ leaderboard: { fieldName: `${FormattedGame.BUILD_BATTLE} Challenges -` } })
  public BUILD_BATTLE: BuildBattleChallenges;

  @Mode("", removeFormatting(FormattedGame.COPS_AND_CRIMS))
  @Field({ leaderboard: { fieldName: `${FormattedGame.COPS_AND_CRIMS} Challenges -` } })
  public COPS_AND_CRIMS: CopsAndCrimsChallenges;

  @Mode("", removeFormatting(FormattedGame.DUELS))
  @Field({ leaderboard: { fieldName: `${FormattedGame.DUELS} Challenges -` } })
  public DUELS: DuelsChallenges;

  @Mode("", removeFormatting(FormattedGame.MEGAWALLS))
  @Field({ leaderboard: { fieldName: `${FormattedGame.MEGAWALLS} Challenges -` } })
  public MEGAWALLS: MegaWallsChallenges;

  @Mode("", removeFormatting(FormattedGame.MURDER_MYSTERY))
  @Field({ leaderboard: { fieldName: `${FormattedGame.MURDER_MYSTERY} Challenges -` } })
  public MURDER_MYSTERY: MurderMysteryChallenges;

  @Mode("", removeFormatting(FormattedGame.PAINTBALL))
  @Field({ leaderboard: { fieldName: `${FormattedGame.PAINTBALL} Challenges -` } })
  public PAINTBALL: PaintballChallenges;

  @Mode("", removeFormatting(FormattedGame.QUAKE))
  @Field({ leaderboard: { fieldName: `${FormattedGame.QUAKE} Challenges -` } })
  public QUAKE: QuakeChallenges;

  @Mode("", removeFormatting(FormattedGame.SKYWARS))
  @Field({ leaderboard: { fieldName: `${FormattedGame.SKYWARS} Challenges -` } })
  public SKYWARS: SkyWarsChallenges;

  @Mode("", removeFormatting(FormattedGame.SMASH_HEROES))
  @Field({ leaderboard: { fieldName: `${FormattedGame.SMASH_HEROES} Challenges -` } })
  public SMASH_HEROES: SmashHeroesChallenges;

  @Mode("", removeFormatting(FormattedGame.SPEED_UHC))
  @Field({ leaderboard: { fieldName: `${FormattedGame.SPEED_UHC} Challenges -` } })
  public SPEED_UHC: SpeedUHCChallenges;

  @Mode("", removeFormatting(FormattedGame.TNT_GAMES))
  @Field({ leaderboard: { fieldName: `${FormattedGame.TNT_GAMES} Challenges -` } })
  public TNT_GAMES: TNTGamesChallenges;

  @Mode("", removeFormatting(FormattedGame.TURBO_KART_RACERS))
  @Field({
    leaderboard: { fieldName: `${FormattedGame.TURBO_KART_RACERS} Challenges -` },
  })
  public TURBO_KART_RACERS: TurboKartRacersChallenges;

  @Mode("", removeFormatting(FormattedGame.UHC))
  @Field({ leaderboard: { fieldName: `${FormattedGame.UHC} Challenges -` } })
  public UHC: UHCChallenges;

  @Mode("", removeFormatting(FormattedGame.VAMPIREZ))
  @Field({ leaderboard: { fieldName: `${FormattedGame.VAMPIREZ} Challenges -` } })
  public VAMPIREZ: VampireZChallenges;

  @Mode("", removeFormatting(FormattedGame.WALLS))
  @Field({ leaderboard: { fieldName: `${FormattedGame.WALLS} Challenges -` } })
  public WALLS: WallsChallenges;

  @Mode("", removeFormatting(FormattedGame.WARLORDS))
  @Field({ leaderboard: { fieldName: `${FormattedGame.WARLORDS} Challenges -` } })
  public WARLORDS: WarlordsChallenges;

  @Mode("", removeFormatting(FormattedGame.WOOLWARS))
  @Field({ leaderboard: { fieldName: `${FormattedGame.WOOLWARS} Challenges -` } })
  public WOOLWARS: WoolWarsChallenges;

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
    this.WOOLWARS = new WoolWarsChallenges(challenges);

    this.total = Math.max(
      Object.values(challenges ?? {}).reduce((p, c) => p + c, 0),
      ap.general_challenger ?? 0
    );
  }
}

export type ChallengeModes = StatsifyApiModes<Challenges, "overall">;
export const CHALLENGE_MODES = new GameModes<ChallengeModes>(
  GetMetadataModes(Challenges)
);

export * from "./game-challenges";
