/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type APIData, findScoreIndex } from "@statsify/util";
import { ColorSchema } from "../color.definition.js";
import { FormattedGame, type GameCode, GameCodeMapping, type GameId, GameIdMapping } from "#game";
import { type NumberSchema, type Ref, s } from "#definition/s";
import { ProgressionSchema, progression } from "../progression.definition.js";
import { add } from "@statsify/math";
import { getLevel } from "./util.js";

const limit = 100_000;

const GuildMemberSchema = s.object({
  rank: s.string(),
  uuid: s.string(),
  displayName: s.string().setLater(),
  username: s.string().setLater(),
  joinTime: s.number().leaderboard(false),
  questParticipation: s.number().leaderboard(false),
  expHistory: s.array(s.number()),
  expHistoryDays: s.array(s.string()),
  daily: s.number().color("§2").leaderboard(false),
  weekly: s.number().color("§2").leaderboard(false),
  monthly: s.number().color("§2").leaderboard(false),
  expiresAt: s.number().leaderboard(false).setLater(),
  guildId: s.string().setLater(),
});

export type GuildMember = s.infer<typeof GuildMemberSchema>;

const GuildRankSchema = s.object({
  name: s.string(),
  tag: s.string().optional(),
  priority: s.number().leaderboard(false),
  default: s.boolean().default(false),
});

export type GuildRank = s.infer<typeof GuildRankSchema>;

type Tiers = { req: number; tier: string }[];

const PRESTIGE_REQUIREMENTS: Tiers = [
  { req: 20, tier: "I" },
  { req: 40, tier: "II" },
  { req: 60, tier: "III" },
  { req: 80, tier: "IV" },
  { req: 100, tier: "V" },
];

const EXPERIENCE_KINGS_REQUIREMENTS: Tiers = [
  { req: 50_000, tier: "I" },
  { req: 100_000, tier: "II" },
  { req: 150_000, tier: "III" },
  { req: 200_000, tier: "IV" },
  { req: 250_000, tier: "V" },
  { req: 275_000, tier: "VI" },
  { req: 300_000, tier: "VII" },
];

const WINNERS_REQUIREMENTS: Tiers = [
  { req: 100, tier: "I" },
  { req: 200, tier: "II" },
  { req: 300, tier: "III" },
  { req: 400, tier: "IV" },
  { req: 500, tier: "V" },
  { req: 750, tier: "VI" },
  { req: 1000, tier: "VII" },
];

const FAMILY_REQUIREMENTS: Tiers = [
  { req: 5, tier: "I" },
  { req: 15, tier: "II" },
  { req: 30, tier: "III" },
  { req: 40, tier: "IV" },
  { req: 50, tier: "V" },
  { req: 60, tier: "VI" },
  { req: 70, tier: "VII" },
];

const achievementTier = (tiers: Tiers, score: number) => tiers[findScoreIndex(tiers, score)]?.tier ?? "";

const achievementProgression = (tiers: Tiers, score: number) =>
  progression(score, tiers[findScoreIndex(tiers, score) + 1]?.req);

/** The prestige tiers count the guild's level, so the guild passes it down */
const guildAchievementsSchema = (level: Ref<NumberSchema>) =>
  s
    .object({
      onlinePlayers: s.number().leaderboard(false),
      familyProgression() {
        return ProgressionSchema.computed(
          (score) => achievementProgression(FAMILY_REQUIREMENTS, score),
          [this.onlinePlayers]
        );
      },
      familyTier() {
        return s
          .string()
          .computed((score) => achievementTier(FAMILY_REQUIREMENTS, score), [this.onlinePlayers])
          .default("I");
      },
      winners: s.number().leaderboard(false),
      winnersProgression() {
        return ProgressionSchema.computed(
          (score) => achievementProgression(WINNERS_REQUIREMENTS, score),
          [this.winners]
        );
      },
      winnersTier() {
        return s
          .string()
          .computed((score) => achievementTier(WINNERS_REQUIREMENTS, score), [this.winners])
          .default("I");
      },
      experienceKings: s.number().leaderboard(false),
      experienceKingsProgression() {
        return ProgressionSchema.computed(
          (score) => achievementProgression(EXPERIENCE_KINGS_REQUIREMENTS, score),
          [this.experienceKings]
        );
      },
      experienceKingsTier() {
        return s
          .string()
          .computed(
            (score) => achievementTier(EXPERIENCE_KINGS_REQUIREMENTS, score),
            [this.experienceKings]
          )
          .default("I");
      },
      prestigeProgression: ProgressionSchema.computed(
        (level) => achievementProgression(PRESTIGE_REQUIREMENTS, level),
        [level]
      ),
      prestigeTier: s
        .string()
        .computed((level) => achievementTier(PRESTIGE_REQUIREMENTS, level), [level])
        .default("I"),
    })
    .leaderboard({ fieldName: "Achievements -" });

const gexp = (name: string) => s.number().leaderboard({ name, fieldName: "GEXP", limit });

const ExpByGameSchema = s
  .object({
    ARCADE: gexp(FormattedGame.ARCADE),
    ARENA_BRAWL: gexp(FormattedGame.ARENA_BRAWL),
    BEDWARS: gexp(FormattedGame.BEDWARS),
    BLITZSG: gexp(FormattedGame.BLITZSG),
    BUILD_BATTLE: gexp(FormattedGame.BUILD_BATTLE),
    COPS_AND_CRIMS: gexp(FormattedGame.COPS_AND_CRIMS),
    DUELS: gexp(FormattedGame.DUELS),
    HOUSING: gexp(FormattedGame.HOUSING),
    MEGAWALLS: gexp(FormattedGame.MEGAWALLS),
    MURDER_MYSTERY: gexp(FormattedGame.MURDER_MYSTERY),
    PAINTBALL: gexp(FormattedGame.PAINTBALL),
    PIT: gexp(FormattedGame.PIT),
    PROTOTYPE: gexp(FormattedGame.PROTOTYPE),
    QUAKE: gexp(FormattedGame.QUAKE),
    SKYWARS: gexp(FormattedGame.SKYWARS),
    SMASH_HEROES: gexp(FormattedGame.SMASH_HEROES),
    SPEED_UHC: gexp(FormattedGame.SPEED_UHC),
    TNT_GAMES: gexp(FormattedGame.TNT_GAMES),
    TURBO_KART_RACERS: gexp(FormattedGame.TURBO_KART_RACERS),
    UHC: gexp(FormattedGame.UHC),
    VAMPIREZ: gexp(FormattedGame.VAMPIREZ),
    WALLS: gexp(FormattedGame.WALLS),
    WARLORDS: gexp(FormattedGame.WARLORDS),
    WOOLGAMES: gexp(FormattedGame.WOOLGAMES),
  })
  .leaderboard({ fieldName: "GEXP -" });

const totalGexp = (name: string) => s.number().color("§2").leaderboard({ limit, name, fieldName: "GEXP" });

export const GuildSchema = s.model("Guild", {
  id: s.string().index({ unique: true }),
  name: s.string(),
  nameToLower() {
    return s
      .string()
      .computed((name) => name?.toLowerCase(), [this.name])
      .index()
      .lowercase();
  },
  nameFormatted() {
    return s
      .string()
      .computed(
        (name, color, tagFormatted) => `${color}${name}${tagFormatted ? ` ${tagFormatted}` : ""}`,
        [this.name, this.tagColor.code, this.tagFormatted]
      );
  },
  description: s.string().optional(),
  createdAt: s.number().leaderboard(false),
  exp(): NumberSchema {
    return s
      .number()
      .color("§2")
      .leaderboard({ fieldName: "Level", hidden: true, additionalFields: [this.level], limit });
  },
  level() {
    return s
      .number()
      .computed((exp) => getLevel(exp).level, [this.exp])
      .subtractInSessions()
      .color("§e")
      .leaderboard(false);
  },
  progression() {
    return ProgressionSchema.computed((exp) => {
      const { current, max } = getLevel(exp);
      return progression(current, max);
    }, [this.exp]);
  },
  members: s.array(GuildMemberSchema),
  ranks: s.array(GuildRankSchema),
  achievements() {
    return guildAchievementsSchema(this.level);
  },
  preferredGames: s.array(s.string<GameId>()),
  publiclyListed: s.boolean().default(true),
  tag: s.string(),
  tagColor: ColorSchema,
  tagFormatted() {
    return s
      .string()
      .computed((tag, color) => (tag ? `${color}[${tag}${color}]` : ""), [this.tag, this.tagColor.code]);
  },
  expByGame: ExpByGameSchema,
  expHistory: s.array(s.number()),
  expHistoryDays: s.array(s.string()),
  scaledExpHistory: s.array(s.number()),
  daily: totalGexp("Daily GEXP"),
  weekly: totalGexp("Weekly GEXP"),
  monthly: totalGexp("Monthly GEXP"),
  scaledDaily: totalGexp("Scaled Daily GEXP"),
  scaledWeekly: totalGexp("Scaled Weekly GEXP"),
  scaledMonthly: totalGexp("Scaled Monthly GEXP"),
  questParticipation: s.number().color("§b").leaderboard({ limit }),
  expiresAt: s.number().leaderboard(false).setLater(),
  cached: s.boolean().store(false).setLater(),
});

export type Guild = s.infer<typeof GuildSchema>;

function guildMember(data: APIData): s.input<typeof GuildMemberSchema> {
  const history = Object.entries(data.expHistory as Record<string, number>);
  const expHistory = history.map(([, exp]) => exp);

  return {
    rank: data.rank,
    uuid: data.uuid,
    joinTime: data.joined,
    questParticipation: data.questParticipation ?? 0,
    expHistory,
    expHistoryDays: history.map(([day]) => day),
    daily: expHistory[0] ?? 0,
    weekly: add(...expHistory),
    monthly: 0,
  };
}

function guildRank(data: APIData): s.input<typeof GuildRankSchema> {
  return {
    name: data.name,
    tag: data.tag,
    priority: data.priority,
    default: data.default,
  };
}

function guildAchievements(
  data: APIData = {}
): s.input<ReturnType<typeof guildAchievementsSchema>> {
  return {
    onlinePlayers: data.ONLINE_PLAYERS ?? 0,
    winners: data.WINNERS ?? 0,
    experienceKings: data.EXPERIENCE_KINGS ?? 0,
  };
}

function expByGame(data: APIData = {}): s.input<typeof ExpByGameSchema> {
  return {
    ARCADE: data[GameCodeMapping.ARCADE],
    ARENA_BRAWL: data[GameCodeMapping.ARENA_BRAWL],
    BEDWARS: data[GameCodeMapping.BEDWARS],
    BLITZSG: data[GameCodeMapping.BLITZSG],
    BUILD_BATTLE: data[GameCodeMapping.BUILD_BATTLE],
    COPS_AND_CRIMS: data[GameCodeMapping.COPS_AND_CRIMS],
    DUELS: data[GameCodeMapping.DUELS],
    HOUSING: data[GameCodeMapping.HOUSING],
    MEGAWALLS: data[GameCodeMapping.MEGAWALLS],
    MURDER_MYSTERY: data[GameCodeMapping.MURDER_MYSTERY],
    PAINTBALL: data[GameCodeMapping.PAINTBALL],
    PIT: data[GameCodeMapping.PIT],
    PROTOTYPE: data[GameCodeMapping.PROTOTYPE],
    QUAKE: data[GameCodeMapping.QUAKE],
    SKYWARS: data[GameCodeMapping.SKYWARS],
    SMASH_HEROES: data[GameCodeMapping.SMASH_HEROES],
    SPEED_UHC: data[GameCodeMapping.SPEED_UHC],
    TNT_GAMES: data[GameCodeMapping.TNT_GAMES],
    TURBO_KART_RACERS: data[GameCodeMapping.TURBO_KART_RACERS],
    UHC: data[GameCodeMapping.UHC],
    VAMPIREZ: data[GameCodeMapping.VAMPIREZ],
    WALLS: data[GameCodeMapping.WALLS],
    WARLORDS: data[GameCodeMapping.WARLORDS],
    WOOLGAMES: data[GameCodeMapping.WOOLGAMES],
  };
}

export function guild(data: APIData = {}): s.input<typeof GuildSchema> {
  // The guild master isn't one of Hypixel's ranks
  const guildMaster = guildRank({
    name: "Guild Master",
    tag: data.hideGmTag ? null : "GM",
    priority: Number.MAX_SAFE_INTEGER,
  });

  return {
    // Hypixel uses MongoDB which has object id fields that start with an underscore
    // oxlint-disable-next-line no-underscore-dangle
    id: data._id,
    name: data.name,
    description: data.description,
    createdAt: data.created,
    exp: data.exp,
    members: (data.members ?? []).map(guildMember),
    ranks: [guildMaster, ...(data.ranks ?? []).map(guildRank)].sort((a, b) => b.priority - a.priority),
    achievements: guildAchievements(data.achievements),
    preferredGames: (data.preferredGames ?? [])
      .map((game: GameCode) => GameIdMapping[game])
      .filter(Boolean),
    publiclyListed: data.publiclyListed,
    tag: data.tag,
    tagColor: { id: data.tagColor ?? "GRAY" },
    expByGame: expByGame(data.guildExpByGameType),
    expHistory: [],
    expHistoryDays: [],
    scaledExpHistory: [],
    daily: 0,
    weekly: 0,
    monthly: 0,
    scaledDaily: 0,
    scaledWeekly: 0,
    scaledMonthly: 0,
    questParticipation: 0,
  };
}
