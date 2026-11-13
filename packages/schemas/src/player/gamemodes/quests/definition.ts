/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type APIData, removeFormatting } from "@statsify/util";
import { type NumberSchema, type ObjectSchema, type Refs, s } from "#definition/s";
import { QuestTime, getQuestCountDuring } from "./util.js";
import { FormattedGame } from "#game";
import { add } from "@statsify/math";

interface QuestNames {
  fieldName?: string;
  name?: string;
}

interface Quest extends QuestNames {
  property: string;
  key: string;
  /** The names of the quest's overall count, the only one that's ranked */
  overall?: QuestNames;
}

interface GameQuests {
  game: keyof typeof FormattedGame;
  daily: readonly Quest[];
  weekly: readonly Quest[];
  monthly?: readonly Quest[];
}

// Lists rather than objects keyed by property: swc's jsonify writes a large object literal with its keys sorted
const QUESTS = [
  {
    game: "ARCADE",
    daily: [
      { property: "gamer", key: "arcade_gamer" },
      { property: "winner", key: "arcade_winner" },
    ],
    weekly: [{ property: "specialist", key: "arcade_specialist" }],
  },
  {
    game: "ARENA_BRAWL",
    daily: [
      { property: "kills", key: "arena_daily_kills" },
      { property: "wins", key: "arena_daily_wins" },
      {
        property: "playArenaDaily",
        key: "arena_daily_play",
        fieldName: "Play Arena",
        overall: { fieldName: "Play Arena (Daily)" },
      },
    ],
    weekly: [
      {
        property: "playArenaWeekly",
        key: "arena_weekly_play",
        fieldName: "Play Arena",
        overall: { fieldName: "Play Arena (Weekly)" },
      },
    ],
  },
  {
    game: "BEDWARS",
    daily: [
      { property: "firstWinOfTheDay", key: "bedwars_daily_win" },
      { property: "oneMoreGame", key: "bedwars_daily_one_more", name: "One More Game!" },
      { property: "painsomnia", key: "bedwars_daily_bed_breaker" },
      { property: "headHunter", key: "bedwars_daily_final_killer" },
    ],
    weekly: [
      { property: "bedRemovalCo", key: "bedwars_weekly_bed_elims", name: "Bed Removal Co." },
      { property: "sleepTight", key: "bedwars_weekly_dream_win", name: "Sleep Tight." },
      { property: "challenger", key: "bedwars_weekly_challenges" },
      { property: "finishingTheJob", key: "bedwars_weekly_final_killer" },
    ],
  },
  {
    game: "BLITZSG",
    daily: [
      { property: "gameOfTheDay", key: "blitz_game_of_the_day" },
      { property: "winNormal", key: "blitz_win" },
      { property: "chestLooter", key: "blitz_loot_chest_daily" },
      { property: "kills", key: "blitz_kills" },
    ],
    weekly: [
      { property: "master", key: "blitz_weekly_master" },
      { property: "expert", key: "blitz_loot_chest_weekly" },
    ],
  },
  {
    game: "BUILD_BATTLE",
    daily: [
      { property: "player", key: "build_battle_player" },
      { property: "winner", key: "build_battle_winner" },
    ],
    weekly: [{ property: "masterArchitect", key: "build_battle_weekly" }],
  },
  {
    game: "DUELS",
    daily: [
      { property: "player", key: "duels_player" },
      { property: "kills", key: "duels_kills" },
      { property: "winner", key: "duels_winner" },
    ],
    weekly: [
      { property: "weeklyKills", key: "duels_weekly_kills" },
      { property: "weeklyWins", key: "duels_weekly_wins" },
    ],
  },
  {
    game: "COPS_AND_CRIMS",
    daily: [
      { property: "winAGame", key: "cvc_win_daily_normal", name: "Win a Game! (Defusal)" },
      {
        property: "kill15Players",
        key: "cvc_kill_daily_normal",
        fieldName: "Kill 15 Players",
        name: "Kill 15 Players! (Defusal)",
      },
      {
        property: "get300Points",
        key: "cvc_kill",
        fieldName: "Get 300 Points",
        name: "Get 300 Points! (Deathmatch)",
      },
      {
        property: "winAGameDeathmatch",
        key: "cvc_win_daily_deathmatch",
        fieldName: "Win a Game",
        name: "Win a Game! (Deathmatch)",
      },
      {
        property: "play3Games",
        key: "cvc_play_daily_gungame",
        fieldName: "Play 3 Games",
        name: "Play 3 Games! (Gun Game)",
      },
    ],
    weekly: [
      { property: "killsAndPoints", key: "cvc_kill_weekly", name: "100 Kills and 1,500 Points" },
    ],
  },
  {
    game: "MEGAWALLS",
    daily: [
      { property: "gameOfTheDay", key: "mega_walls_play" },
      { property: "win", key: "mega_walls_win" },
      { property: "kills", key: "mega_walls_kill" },
      { property: "faithful", key: "mega_walls_faithful" },
    ],
    weekly: [{ property: "megaWaller", key: "mega_walls_weekly" }],
  },
  {
    game: "MURDER_MYSTERY",
    daily: [
      { property: "winner", key: "mm_daily_win" },
      { property: "powerPlay", key: "mm_daily_power_play" },
      { property: "hitman", key: "mm_daily_target_kill" },
      { property: "infector", key: "mm_daily_infector" },
    ],
    weekly: [
      { property: "professional", key: "mm_weekly_murderer_kills" },
      { property: "bigWinner", key: "mm_weekly_wins" },
    ],
  },
  {
    game: "PAINTBALL",
    daily: [
      { property: "paintballer", key: "paintballer" },
      { property: "killer", key: "paintball_killer" },
    ],
    weekly: [{ property: "expert", key: "paintball_expert" }],
  },
  {
    game: "PIT",
    daily: [
      { property: "hunter", key: "prototype_pit_daily_kills" },
      { property: "contracted", key: "prototype_pit_daily_contract" },
    ],
    weekly: [{ property: "doubleUp", key: "prototype_pit_weekly_gold" }],
  },
  {
    game: "QUAKE",
    daily: [
      { property: "player", key: "quake_daily_play" },
      { property: "sniper", key: "quake_daily_kill" },
      { property: "winner", key: "quake_daily_win" },
    ],
    weekly: [{ property: "bazinga", key: "quake_weekly_play", name: "Bazinga!" }],
  },
  {
    game: "SKYWARS",
    daily: [
      { property: "miniSkyWarsWins", key: "skywars_daily_mini_win" },
      { property: "skyWarsSoloWins", key: "skywars_solo_win" },
      { property: "skyWarsDoublesWins", key: "skywars_team_win" },
      { property: "luckyBlockSkyWarsWins", key: "skywars_arcade_win" },
      { property: "megaSkyWarsKills", key: "skywars_daily_mega_kills" },
    ],
    weekly: [
      { property: "skyWarsWins", key: "skywars_weekly_wins" },
      { property: "skyWarsKills", key: "skywars_weekly_kills" },
    ],
    monthly: [{ property: "earnAnOpal", key: "skywars_monthly_earn_opals" }],
  },
  {
    game: "SMASH_HEROES",
    daily: [
      { property: "soloWin", key: "supersmash_solo_win" },
      { property: "soloKills", key: "supersmash_solo_kills" },
      { property: "teamWin", key: "supersmash_team_win" },
      { property: "teamKills", key: "supersmash_team_kills" },
    ],
    weekly: [{ property: "weeklyKills", key: "supersmash_weekly_kills" }],
  },
  {
    game: "SPEED_UHC",
    daily: [
      { property: "soloSpeedBrawler", key: "solo_brawler" },
      { property: "teamSpeedBrawler", key: "team_brawler" },
    ],
    weekly: [{ property: "madness", key: "uhc_madness" }],
  },
  {
    game: "TNT_GAMES",
    daily: [
      { property: "winner", key: "tnt_daily_win" },
      {
        property: "tntRunDaily",
        key: "tnt_tntrun_daily",
        fieldName: "TNT Run",
        overall: { fieldName: "TNT Run (Daily)" },
      },
      {
        property: "pvpRunDaily",
        key: "tnt_pvprun_daily",
        fieldName: "PVP Run",
        overall: { fieldName: "PVP Run (Daily)" },
      },
      {
        property: "bowSpleefDaily",
        key: "tnt_bowspleef_daily",
        fieldName: "Bow Spleef",
        overall: { fieldName: "Bow Spleef (Daily)" },
      },
      {
        property: "tntTagDaily",
        key: "tnt_tnttag_daily",
        fieldName: "TNT Tag",
        overall: { fieldName: "TNT Tag (Daily)" },
      },
      {
        property: "tntWizardsDaily",
        key: "tnt_wizards_daily",
        fieldName: "TNT Wizards",
        overall: { fieldName: "TNT Wizards (Daily)" },
      },
    ],
    weekly: [
      { property: "explosiveFanatic", key: "tnt_weekly_play" },
      {
        property: "tntRunWeekly",
        key: "tnt_tntrun_weekly",
        fieldName: "TNT Run",
        overall: { fieldName: "TNT Run (Weekly)" },
      },
      {
        property: "pvpRunWeekly",
        key: "tnt_pvprun_weekly",
        fieldName: "PVP Run",
        overall: { fieldName: "PVP Run (Weekly)" },
      },
      {
        property: "bowSpleefWeekly",
        key: "tnt_bowspleef_weekly",
        fieldName: "Bow Spleef",
        overall: { fieldName: "Bow Spleef (Weekly)" },
      },
      {
        property: "tntTagWeekly",
        key: "tnt_tnttag_weekly",
        fieldName: "TNT Tag",
        overall: { fieldName: "TNT Tag (Weekly)" },
      },
      {
        property: "tntWizardsWeekly",
        key: "tnt_wizards_weekly",
        fieldName: "TNT Wizards",
        overall: { fieldName: "TNT Wizards (Weekly)" },
      },
    ],
  },
  {
    game: "TURBO_KART_RACERS",
    daily: [
      { property: "blingBling", key: "gingerbread_bling_bling" },
      { property: "internationalChampionship", key: "gingerbread_maps" },
      { property: "racer", key: "gingerbread_racer" },
    ],
    weekly: [{ property: "turboKartRacers", key: "gingerbread_mastery" }],
  },
  {
    game: "UHC",
    daily: [
      { property: "teamUHCChampions", key: "uhc_team", fieldName: "Team UHC Champions" },
      { property: "soloUHCChampions", key: "uhc_solo", fieldName: "Solo UHC Champions" },
      { property: "uhcDeathmatch", key: "uhc_dm", fieldName: "UHC Deathmatch" },
    ],
    weekly: [{ property: "uhcChampions", key: "uhc_weekly", fieldName: "UHC Champions" }],
  },
  {
    game: "VAMPIREZ",
    daily: [
      { property: "vampirez", key: "vampirez_daily_play", fieldName: "VampireZ" },
      { property: "bloodDrinker", key: "vampirez_daily_kill" },
      { property: "humanKiller", key: "vampirez_daily_human_kill" },
      { property: "dailyWin", key: "vampirez_daily_win" },
    ],
    weekly: [
      { property: "vampireWinner", key: "vampirez_weekly_win" },
      { property: "vampireSlayer", key: "vampirez_weekly_kill" },
      { property: "humanSlayer", key: "vampirez_weekly_human_kill" },
    ],
  },
  {
    game: "WALLS",
    daily: [
      { property: "waller", key: "walls_daily_play" },
      { property: "kills", key: "walls_daily_kill" },
      { property: "win", key: "walls_daily_win" },
    ],
    weekly: [{ property: "wallsWeekly", key: "walls_weekly" }],
  },
  {
    game: "WARLORDS",
    daily: [
      { property: "captureTheFlag", key: "warlords_ctf" },
      { property: "teamDeathmatch", key: "warlords_tdm" },
      { property: "domination", key: "warlords_domination" },
      { property: "victorious", key: "warlords_victorious" },
      { property: "carrySecured", key: "warlords_objectives", name: "Carry, Secured!" },
    ],
    weekly: [
      { property: "dedication", key: "warlords_dedication" },
      { property: "allStar", key: "warlords_all_star" },
    ],
  },
  {
    game: "WOOLGAMES",
    daily: [
      { property: "firstPlayOfTheDay", key: "wool_wars_daily_play" },
      { property: "winnerWinnerLambDinner", key: "wool_wars_daily_wins" },
      { property: "kills", key: "wool_wars_daily_kills" },
    ],
    weekly: [
      { property: "kingOfTheHerd", key: "wool_weekly_play" },
      { property: "woolConnoisseur", key: "wool_wars_weekly_shears" },
    ],
  },
] as const satisfies readonly GameQuests[];

const PERIODS = {
  daily: QuestTime.Daily,
  weekly: QuestTime.Weekly,
  monthly: QuestTime.Monthly,
  overall: QuestTime.Overall,
} as const;

type Period = keyof typeof PERIODS;
type Game = (typeof QUESTS)[number]["game"];

/** The properties of a game's quests during a period, where overall has every quest */
type QuestKey<G extends Game, P extends Period> = {
  [T in Exclude<Period, "overall">]: P extends "overall" | T ?
    Extract<(typeof QUESTS)[number], { game: G }> extends Record<T, infer Q extends readonly Quest[]> ?
      Q[number]["property"] :
      never :
    never;
}[Exclude<Period, "overall">];

type GameQuestsSchema<G extends Game, P extends Period> = ObjectSchema<
  Record<"total" | QuestKey<G, P>, NumberSchema>
>;

type QuestsDuringSchema<P extends Period> = ObjectSchema<{ [G in Game]: GameQuestsSchema<G, P> }>;

function questsDuring({ daily, weekly, monthly = [] }: GameQuests, period: Period) {
  return period === "overall" ? [...daily, ...weekly, ...monthly] : { daily, weekly, monthly }[period];
}

// Only overall counts are ranked, under their overall names where a quest has them
const questSchema = (quest: Quest, period: Period) =>
  function (this: Refs<{ total: NumberSchema }>) {
    const names = period === "overall" && quest.overall ? quest.overall : quest;

    return s.number().leaderboard({
      enabled: period === "overall",
      limit: 10_000,
      fieldName: names.fieldName,
      name: names.name,
      additionalFields: [this.total],
    });
  };

const gameQuestsSchema = (quests: GameQuests, period: Period) =>
  s
    .object({
      total: s
        .number()
        .color("§a")
        .leaderboard({
          enabled: period === "overall",
          fieldName: `${removeFormatting(FormattedGame[quests.game])} Total`,
          name: "Total",
        }),
      ...Object.fromEntries(
        questsDuring(quests, period).map((quest) => [quest.property, questSchema(quest, period)])
      ),
    })
    .leaderboard({ fieldName: `${FormattedGame[quests.game]} Quests -` });

const questsDuringSchema = <P extends Period>(period: P) => {
  const games = Object.fromEntries(
    QUESTS.map((quests) => [quests.game, gameQuestsSchema(quests, period)])
  );

  return s.object(games as { [G in Game]: GameQuestsSchema<G, P> });
};

export const QuestsSchema = s
  .object({
    total: s.number().color("§b").leaderboard({ name: "Total Quests", fieldName: "Quests" }),
    weeklyTotal: s
      .number()
      .leaderboard({ name: "Weekly Quests", fieldName: "Quests", resetEvery: "friday" }),
    dailyTotal: s.number().leaderboard({ name: "Daily Quests", fieldName: "Quests", resetEvery: "day" }),
    overall: questsDuringSchema("overall").leaderboard({ fieldName: "" }),
    monthly: questsDuringSchema("monthly"),
    weekly: questsDuringSchema("weekly"),
    daily: questsDuringSchema("daily"),
  })
  .leaderboard({ name: "", fieldName: "§eQuests§r" });

export type Quests = s.infer<typeof QuestsSchema>;

function questCountsDuring<P extends Period>(data: APIData, period: P) {
  const games = QUESTS.map((quests) => {
    const counts = Object.fromEntries(
      questsDuring(quests, period).map(({ property, key }) => [
        property,
        getQuestCountDuring(PERIODS[period], data[key]),
      ])
    );

    return [quests.game, { total: add(...Object.values(counts)), ...counts }];
  });

  return Object.fromEntries(games) as s.input<QuestsDuringSchema<P>>;
}

const sumTotals = (games: Record<string, { total: number }>) =>
  add(...Object.values(games).map((game) => game.total));

export function quests(data: APIData = {}): s.input<typeof QuestsSchema> {
  const weekly = questCountsDuring(data, "weekly");
  const daily = questCountsDuring(data, "daily");

  return {
    // Some quests like SkyClash and Crazy Walls aren't stored by us.
    total: Object.values<APIData>(data).reduce(
      (total, quest) => total + (quest?.completions?.length ?? 0),
      0
    ),
    weeklyTotal: sumTotals(weekly),
    dailyTotal: sumTotals(daily),
    overall: questCountsDuring(data, "overall"),
    monthly: questCountsDuring(data, "monthly"),
    weekly,
    daily,
  };
}
