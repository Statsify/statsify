/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  ArcadeChallenges,
  ArenaBrawlChallenges,
  BedWarsChallenges,
  BlitzSGChallenges,
  BuildBattleChallenges,
  CHALLENGE_MODES,
  type ChallengeModes,
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
  scanMetadata,
} from "@statsify/schemas";
import type { Game, Shape } from "../catalog.js";
import { prettify } from "@statsify/util";

/** Each game's challenges class, whose own metadata holds the names the card shows (the player's are prefixed). */
const CLASSES: Record<string, Parameters<typeof scanMetadata>[0]> = {
  ARCADE: ArcadeChallenges,
  ARENA_BRAWL: ArenaBrawlChallenges,
  BEDWARS: BedWarsChallenges,
  BLITZSG: BlitzSGChallenges,
  BUILD_BATTLE: BuildBattleChallenges,
  COPS_AND_CRIMS: CopsAndCrimsChallenges,
  DUELS: DuelsChallenges,
  MEGAWALLS: MegaWallsChallenges,
  MURDER_MYSTERY: MurderMysteryChallenges,
  PAINTBALL: PaintballChallenges,
  QUAKE: QuakeChallenges,
  SKYWARS: SkyWarsChallenges,
  SMASH_HEROES: SmashHeroesChallenges,
  SPEED_UHC: SpeedUHCChallenges,
  TNT_GAMES: TNTGamesChallenges,
  TURBO_KART_RACERS: TurboKartRacersChallenges,
  UHC: UHCChallenges,
  VAMPIREZ: VampireZChallenges,
  WALLS: WallsChallenges,
  WARLORDS: WarlordsChallenges,
  WOOLGAMES: WoolGamesChallenges,
};

/**
 * The bot's `/challenges` card (`challenges.profile.tsx`): the total in §b, each game's total in §a, and its challenges
 * under their leaderboard names, coloured by rank where they're shown.
 */
export const CHALLENGES: Game<ChallengeModes> = {
  key: "challenges",
  id: null,
  modes: CHALLENGE_MODES,
  game: { total: { colour: "§b", glossary: "challengesTotal" } },
  shapes: Object.entries(CLASSES).map(([game, type]): Shape => ({
    modes: [game],
    stats: Object.fromEntries(
      scanMetadata(type).map(([key, { leaderboard }]) => [
        key,
        key === "total" ? { colour: "§a", glossary: "challengesTotal" } : { colour: "§a", name: leaderboard.name ?? prettify(key) },
      ])
    ),
  })),
};
