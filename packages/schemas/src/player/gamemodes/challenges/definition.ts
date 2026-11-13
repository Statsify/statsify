/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type APIData, removeFormatting } from "@statsify/util";
import { type NumberSchema, type ObjectSchema, type Refs, s } from "#definition/s";
import { FormattedGame } from "#game";
import { add } from "@statsify/math";

interface Challenge {
  property: string;
  key: string;
  /** The leaderboard name, where prettifying the property gets it wrong */
  name?: string;
}

interface GameChallenges {
  game: keyof typeof FormattedGame;
  challenges: readonly Challenge[];
}

// Lists rather than objects keyed by property: swc's jsonify writes a large object literal with its keys sorted
const CHALLENGES = [
  {
    game: "ARCADE",
    challenges: [
      { property: "farmHunt", key: "ARCADE__farm_hunt_challenge" },
      { property: "blockingDead", key: "ARCADE__blocking_dead_challenge" },
      { property: "bountyHunters", key: "ARCADE__bounty_hunter_challenge" },
      { property: "creeperAttack", key: "ARCADE__creeper_attack_challenge" },
      { property: "dragonWars", key: "ARCADE__dragon_wars_challenge" },
      { property: "dropper", key: "ARCADE__dropper_challenge" },
      { property: "enderSpleef", key: "ARCADE__ender_spleef_challenge" },
      { property: "galaxyWars", key: "ARCADE__galaxy_wars_challenge" },
      { property: "throwOut", key: "ARCADE__throw_out_challenge" },
      { property: "holeInTheWall", key: "ARCADE__hole_in_the_wall_challenge" },
      { property: "hypixelSays", key: "ARCADE__hypixel_says_challenge" },
      { property: "pixelPainters", key: "ARCADE__pixel_painters_challenge" },
      { property: "partyGames", key: "ARCADE__party_games_challenge" },
      { property: "football", key: "ARCADE__football_challenge" },
      { property: "miniWalls", key: "ARCADE__mini_walls_challenge" },
      { property: "zombies", key: "ARCADE__zombies_challenge" },
      { property: "hideAndSeek", key: "ARCADE__hide_and_seek_challenge" },
      { property: "pixelParty", key: "ARCADE__pixel_party_challenge" },
    ],
  },
  {
    game: "ARENA_BRAWL",
    challenges: [
      { property: "whereIsIt", key: "ARENA__where_is_it_challenge", name: "WHERE IS IT" },
      { property: "tripleKill", key: "ARENA__triple_kill_challenge" },
      { property: "noUltimate", key: "ARENA__no_ultimate_challenge" },
      { property: "cooperation", key: "ARENA__cooperation_challenge" },
    ],
  },
  {
    game: "BEDWARS",
    challenges: [
      { property: "defensive", key: "BEDWARS__defensive" },
      { property: "support", key: "BEDWARS__support" },
      { property: "offensive", key: "BEDWARS__offensive" },
    ],
  },
  {
    game: "BLITZSG",
    challenges: [
      { property: "star", key: "SURVIVAL_GAMES__star_challenge" },
      { property: "ironMan", key: "SURVIVAL_GAMES__iron_man_challenge" },
      { property: "blitz", key: "SURVIVAL_GAMES__blitz_challenge" },
      { property: "resistance", key: "SURVIVAL_GAMES__resistance_challenge" },
    ],
  },
  {
    game: "BUILD_BATTLE",
    challenges: [
      { property: "topThree", key: "BUILD_BATTLE__top_3_challenge" },
      { property: "guesser", key: "BUILD_BATTLE__guesser_challenge" },
    ],
  },
  {
    game: "COPS_AND_CRIMS",
    challenges: [
      { property: "pistol", key: "MCGO__pistol_challenge" },
      { property: "knife", key: "MCGO__knife_challenge" },
      { property: "grenade", key: "MCGO__grenade_challenge" },
      { property: "killingSpree", key: "MCGO__killing_spree_challenge" },
    ],
  },
  {
    game: "DUELS",
    challenges: [
      { property: "feedTheVoid", key: "DUELS__feed_the_void_challenge" },
      { property: "teams", key: "DUELS__teams_challenge" },
      { property: "targetPractice", key: "DUELS__target_practice_challenge" },
    ],
  },
  {
    game: "MEGAWALLS",
    challenges: [
      { property: "wither", key: "WALLS3__wither_challenge" },
      { property: "protector", key: "WALLS3__protector_challenge" },
      { property: "berserk", key: "WALLS3__berserk_challenge" },
      { property: "comeback", key: "WALLS3__comeback_challenge" },
    ],
  },
  {
    game: "MURDER_MYSTERY",
    challenges: [
      { property: "murderSpree", key: "MURDER_MYSTERY__murder_spree" },
      { property: "sherlock", key: "MURDER_MYSTERY__sherlock" },
      { property: "hero", key: "MURDER_MYSTERY__hero" },
      { property: "serialKiller", key: "MURDER_MYSTERY__serial_killer" },
    ],
  },
  {
    game: "PAINTBALL",
    challenges: [
      { property: "killStreak", key: "PAINTBALL__kill_streak_challenge" },
      { property: "killingSpree", key: "PAINTBALL__killing_spree_challenge" },
      { property: "nuke", key: "PAINTBALL__nuke_challenge" },
      { property: "finish", key: "PAINTBALL__finish_challenge" },
    ],
  },
  {
    game: "QUAKE",
    challenges: [
      { property: "powerup", key: "QUAKECRAFT__powerup_challenge" },
      { property: "killingStreak", key: "QUAKECRAFT__killing_streak_challenge" },
      { property: "dontBlink", key: "QUAKECRAFT__don't_blink_challenge", name: "Don't Blink" },
      { property: "combo", key: "QUAKECRAFT__combo_challenge" },
    ],
  },
  {
    game: "SKYWARS",
    challenges: [
      { property: "feedingTheVoid", key: "SKYWARS__feeding_the_void_challenge" },
      { property: "rush", key: "SKYWARS__rush_challenge" },
      { property: "ranked", key: "SKYWARS__ranked_challenge" },
      { property: "enderman", key: "SKYWARS__enderman_challenge" },
    ],
  },
  {
    game: "SMASH_HEROES",
    challenges: [
      { property: "leaderboard", key: "SUPER_SMASH__leaderboard_challenge" },
      { property: "crystal", key: "SUPER_SMASH__crystal_challenge" },
      { property: "smash", key: "SUPER_SMASH__smash_challenge" },
      { property: "flawless", key: "SUPER_SMASH__flawless_challenge" },
    ],
  },
  {
    game: "SPEED_UHC",
    challenges: [
      { property: "alchemist", key: "SPEED_UHC__alchemist_challenge" },
      { property: "wizard", key: "SPEED_UHC__wizard_challenge" },
      { property: "marksman", key: "SPEED_UHC__marksman_challenge" },
      { property: "nether", key: "SPEED_UHC__nether_challenge" },
    ],
  },
  {
    game: "TNT_GAMES",
    challenges: [
      { property: "tntRun", key: "TNTGAMES__tnt_run_challenge", name: "TNT Run" },
      { property: "pvpRun", key: "TNTGAMES__pvp_run_challenge", name: "PVP Run" },
      { property: "bowSpleef", key: "TNTGAMES__bow_spleef_challenge" },
      { property: "tntTag", key: "TNTGAMES__tnt_tag_challenge", name: "TNT Tag" },
      { property: "tntWizards", key: "TNTGAMES__tnt_wizards_challenge", name: "TNT Wizards" },
    ],
  },
  {
    game: "TURBO_KART_RACERS",
    challenges: [
      { property: "coin", key: "GINGERBREAD__coin_challenge" },
      { property: "firstPlace", key: "GINGERBREAD__first_place_challenge" },
      { property: "banana", key: "GINGERBREAD__banana_challenge" },
      { property: "leaderboard", key: "GINGERBREAD__leaderboard_challenge" },
    ],
  },
  {
    game: "UHC",
    challenges: [
      { property: "longshot", key: "UHC__longshot_challenge" },
      { property: "perfectStart", key: "UHC__perfect_start_challenge" },
      { property: "hunter", key: "UHC__hunter_challenge" },
      { property: "threat", key: "UHC__threat_challenge" },
    ],
  },
  {
    game: "VAMPIREZ",
    challenges: [
      { property: "fang", key: "VAMPIREZ__fang_challenge" },
      { property: "gold", key: "VAMPIREZ__gold_challenge" },
      { property: "purifying", key: "VAMPIREZ__purifying_challenge" },
      { property: "lastStand", key: "VAMPIREZ__last_stand_challenge" },
    ],
  },
  {
    game: "WALLS",
    challenges: [
      { property: "firstBlood", key: "WALLS__first_blood_challenge" },
      { property: "powerhouse", key: "WALLS__powerhouse_challenge" },
      { property: "looting", key: "WALLS__looting_challenge" },
      { property: "doubleKill", key: "WALLS__double_kill_challenge" },
    ],
  },
  {
    game: "WARLORDS",
    challenges: [
      { property: "support", key: "BATTLEGROUND__support_challenge" },
      { property: "brute", key: "BATTLEGROUND__brute_challenge" },
      { property: "capture", key: "BATTLEGROUND__capture_challenge" },
      { property: "carry", key: "BATTLEGROUND__carry_challenge" },
    ],
  },
  {
    game: "WOOLGAMES",
    challenges: [
      {
        property: "woolWarsChallenge",
        key: "WOOL_GAMES__wool_wars_challenge",
        name: "WoolWars Challenge",
      },
      {
        property: "sheepWarsChallenge",
        key: "WOOL_GAMES__sheep_wars_challenge",
        name: "SheepWars Challenge",
      },
      { property: "captureTheWoolChallenge", key: "WOOL_GAMES__capture_the_wool_challenge" },
    ],
  },
] as const satisfies readonly GameChallenges[];

type Game = (typeof CHALLENGES)[number]["game"];

type GameChallengesSchema<G extends Game> = ObjectSchema<
  Record<
    "total" | Extract<(typeof CHALLENGES)[number], { game: G }>["challenges"][number]["property"],
    NumberSchema
  >
>;

const challengeSchema = ({ name }: Challenge) =>
  function (this: Refs<{ total: NumberSchema }>) {
    return s.number().leaderboard({ limit: 10_000, name, additionalFields: [this.total] });
  };

const gameChallengesSchema = (game: GameChallenges) =>
  s
    .object({
      ...s.keyed(game.challenges, challengeSchema),
      total: s
        .number()
        .color("§a")
        .leaderboard({
          fieldName: `${removeFormatting(FormattedGame[game.game])} Total`,
          name: "Total",
        }),
    })
    .leaderboard({ fieldName: `${FormattedGame[game.game]} Challenges -` });

const gameSchemas = Object.fromEntries(
  CHALLENGES.map((game) => [game.game, gameChallengesSchema(game)])
);

export const ChallengesSchema = s
  .object({
    ...(gameSchemas as { [G in Game]: GameChallengesSchema<G> }),
    total: s
      .number()
      .color("§b")
      .leaderboard({ name: "Total Challenges", fieldName: "Challenges" }),
  })
  .leaderboard({ name: "", fieldName: "§aChallenges§r" });

export type Challenges = s.infer<typeof ChallengesSchema>;

function gameChallenges(data: APIData, game: GameChallenges) {
  const completions = s.keyed(game.challenges, ({ key }) => data[key]);

  return { ...completions, total: add(...Object.values(completions)) };
}

export function challenges(
  data: APIData = {},
  achievements: APIData = {}
): s.input<typeof ChallengesSchema> {
  const games = Object.fromEntries(CHALLENGES.map((game) => [game.game, gameChallenges(data, game)]));

  return {
    ...(games as { [G in Game]: s.input<GameChallengesSchema<G>> }),
    total: Math.max(
      Object.values<number>(data).reduce((total, completions) => total + completions, 0),
      achievements.general_challenger ?? 0
    ),
  };
}
