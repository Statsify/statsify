/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type ContractRouterClient, oc } from "@orpc/contract";
import { z } from "zod";

/** A Minecraft UUID, dashed or not; the API normalizes it before querying. */
export const UuidSchema = z
  .string()
  .regex(/^[\da-f]{32}$|^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i, "Expected a Minecraft UUID");

export const UsernameSchema = z.string().trim().min(1).max(16);

/** The visitor's real address, read by the site from `CF-Connecting-IP`. */
const ClientIpSchema = z.string().trim().min(1).max(45);

const Count = z.number();

/** Whose page or card it is. */
const PlayerName = { uuid: z.string(), username: z.string(), displayName: z.string() };

const Freshness = {
  /** When the API last fetched the player from Hypixel (ms). */
  updatedAt: z.number(),
  /** When the API will fetch again on the next `refresh` (ms); the refresh button counts down to it. */
  expiresAt: z.number(),
};

export const PlayerIdentitySchema = z.object({
  uuid: z.string(),
  username: z.string(),
  /** When the API last fetched the player from Hypixel (ms); keys the unfurl image cache. */
  updatedAt: z.number(),
});

/** One label/value row of a game panel. */
export const StatRowSchema = z.object({
  /** A `stats.*` key in `locales/<lng>/default.json`. */
  key: z.string(),
  /** Numbers are formatted by the site; strings are Minecraft-formatted text (levels, prefixes). */
  value: z.union([z.number(), z.string()]),
  /** Printed after a number, as on the card, e.g. `%`. */
  suffix: z.string().optional(),
});

export const GameSummarySchema = z.object({
  /** The `GameId`, e.g. `BEDWARS`. */
  id: z.string(),
  /** The Minecraft-formatted game name, e.g. `§cBed§fWars§f`. */
  name: z.string(),
  /** Minecraft-formatted level or prefix string, when the game has one. */
  level: z.string().optional(),
  rows: z.array(StatRowSchema).max(4),
});

export const PlayerPageSchema = z.object({
  ...PlayerName,
  prefixName: z.string(),
  rank: z.string(),
  guild: z
    .object({
      id: z.string(),
      name: z.string(),
      tag: z.string().optional(),
      tagFormatted: z.string().optional(),
    })
    .nullable(),
  overview: z.object({
    achievementPoints: Count,
    karma: Count,
    quests: Count,
    challenges: Count,
    giftsSent: Count,
    ranksGifted: Count,
    currentRewardStreak: Count,
    highestRewardStreak: Count,
    /** The general card's guild row: the player's own entry in the stored guild's member list, null when it doesn't list them. */
    guildMember: z.object({ questParticipation: Count, daily: Count, weekly: Count }).nullable(),
  }),
  level: z.object({
    level: z.number(),
    exp: Count,
    /** EXP into the current level and the EXP the level spans. */
    current: Count,
    max: Count,
    percent: z.number().min(0).max(1),
    /** Coin multiplier derived from the level (see `levelMultiplier`). */
    multiplier: z.number(),
  }),
  status: z.object({
    online: z.boolean(),
    statusHidden: z.boolean(),
    firstLogin: z.number(),
    lastLogin: z.number(),
    lastLogout: z.number(),
    /** The last game played, when known: its `GameId` and Minecraft-formatted name. */
    lastGame: z.object({ id: z.string(), name: z.string() }).nullable(),
  }),
  socials: z
    .object({
      discord: z.string(),
      forums: z.string(),
      instagram: z.string(),
      tiktok: z.string(),
      twitch: z.string(),
      twitter: z.string(),
      youtube: z.string(),
    })
    .partial(),
  games: z.array(GameSummarySchema),
  ...Freshness,
});

/** The stored player document as JSON, for the card renderer. Server-only, never proxied. */
export type PlayerDocument = Record<string, unknown>;
/** The player's guild document as JSON (name, tag and the member rows the card shows). */
export type GuildDocument = Record<string, unknown>;

const isDocument = (value: unknown) => typeof value === "object" && value !== null;
const PlayerDocumentSchema = z.custom<PlayerDocument>(isDocument);
const GuildDocumentSchema = z.custom<GuildDocument>(isDocument);

export const PlayerFullSchema = z.object({
  player: PlayerDocumentSchema,
  guild: GuildDocumentSchema.nullable(),
});

export const ResultCardSchema = z.object({
  ...PlayerName,
  rank: z.string(),
  /** The Minecraft-formatted guild tag, when the player is in a guild. */
  guildTag: z.string().nullable(),
  achievementPoints: Count,
  quests: Count,
  karma: Count,
});

export const LeaderboardGroupSchema = z.object({
  /** The `GameId` for the icon, or `null` for groups without a game (quests, challenges). */
  game: z.string().nullable(),
  name: z.string(),
  leaderboards: z.array(z.object({ field: z.string(), name: z.string() })),
});

export const LeaderboardRowSchema = z.object({
  uuid: z.string(),
  /** The player's current name, so the row links to their page without the UUID's redirect. */
  username: z.string(),
  position: z.number(),
  /** Minecraft-formatted display name, prefixed with the leaderboard's extra display (level, prefix). */
  name: z.string(),
  highlight: z.boolean(),
  values: z.array(z.union([z.string(), z.number()])),
});

export const LeaderboardPageSchema = z.object({
  field: z.string(),
  name: z.string(),
  /** Column headers, matching `rows[].values`. */
  fields: z.array(z.string()),
  page: z.number(),
  pages: z.number(),
  rows: z.array(LeaderboardRowSchema),
});

/** One category's task counters, keyed by the board data's `field`. */
const BingoCounters = z.record(z.string(), z.number());
const BingoBoardsSchema = z.object({ casual: BingoCounters, pvp: BingoCounters, classic: BingoCounters });

/** What the Bingo tracker needs: the boards, not the player document. */
export const BingoPlayerSchema = z.object({
  ...PlayerName,
  bingo: z.object({ easy: BingoBoardsSchema, hard: BingoBoardsSchema }),
  ...Freshness,
});

const ProgressionSchema = z.object({ current: z.number(), max: z.number().optional(), percent: z.number() });

// The home page's preview panels show fixed sample players, a guild and a leaderboard. Each view
// model carries only the fields its panel reads, so the HTML never ships a whole player document.
const PreviewPlayer = { uuid: z.string(), prefixName: z.string() };
const WinLoss = { wins: Count, losses: Count, wlr: Count };

export const PreviewIdentitySchema = z.object(PreviewPlayer);

export const BedWarsPreviewSchema = z.object({
  ...PreviewPlayer,
  progression: ProgressionSchema,
  naturalLevelFormatted: z.string(),
  nextLevelFormatted: z.string(),
  tokens: Count,
  overall: z.object({
    ...WinLoss,
    winstreak: Count,
    itemsCollected: z.object({ iron: Count, gold: Count, diamond: Count, emerald: Count }),
  }),
});

export const SkyWarsPreviewSchema = z.object({
  ...PreviewPlayer,
  progression: ProgressionSchema,
  levelFormatted: z.string(),
  naturalLevelFormatted: z.string(),
  nextLevelFormatted: z.string(),
  coins: Count,
  tokens: Count,
  souls: Count,
  opals: Count,
  heads: Count,
  potionsBrewed: Count,
  overall: z.object(WinLoss),
});

export const DuelsPreviewSchema = z.object({
  ...PreviewPlayer,
  tokens: Count,
  pingRange: Count,
  overall: z.object({
    ...WinLoss,
    progression: ProgressionSchema,
    titleFormatted: z.string(),
    titleLevelFormatted: z.string(),
    nextTitleLevelFormatted: z.string(),
    blocksPlaced: Count,
    shotsFired: Count,
  }),
});

export const ArcadePreviewSchema = z.object({
  ...PreviewPlayer,
  coins: Count,
  coinConversions: Count,
  wins: Count,
  /** Wins per Arcade game, keyed like `PlayerStats["arcade"]` (`blockingDead`, `hideAndSeek`, …). */
  gameWins: z.record(z.string(), Count),
});

export const GuildPreviewMemberSchema = z.object({
  uuid: z.string(),
  displayName: z.string(),
  rank: z.string(),
  joinTime: z.number(),
  questParticipation: Count,
  daily: Count,
  weekly: Count,
  monthly: Count,
});

export const GuildPreviewSchema = z.object({
  name: z.string(),
  nameFormatted: z.string(),
  tagFormatted: z.string(),
  /** The tag's Minecraft color code, e.g. `§6`, which colors the level bar. */
  tagColor: z.string(),
  description: z.string(),
  createdAt: z.number(),
  exp: Count,
  level: z.number(),
  progression: ProgressionSchema,
  daily: Count,
  weekly: Count,
  monthly: Count,
  /** Each game's `GameId` and name; the site shows the ones it has icons for, the name as the icon's alt text. */
  preferredGames: z.array(z.object({ id: z.string(), name: z.string() })),
  memberCount: z.number(),
  /** The six members with the most GEXP today, most first: the slide shows them, not the whole roster. */
  topDaily: z.array(GuildPreviewMemberSchema),
  /** The guild master's Minecraft-formatted name, or null when no member on record has the rank or a name. */
  master: z.string().nullable(),
  /** The member the "Guild Member" slide features, when they are still in the guild. */
  member: GuildPreviewMemberSchema.nullable(),
});

/** Every preview is loaded on its own and is `null` when its data is missing, so the section hides. */
export const HomePreviewsSchema = z.object({
  players: z.object({
    bedwars: BedWarsPreviewSchema.nullable(),
    skywars: SkyWarsPreviewSchema.nullable(),
    duels: DuelsPreviewSchema.nullable(),
    arcade: ArcadePreviewSchema.nullable(),
    session: PreviewIdentitySchema.nullable(),
  }),
  guild: GuildPreviewSchema.nullable(),
  leaderboard: LeaderboardPageSchema.nullable(),
});

const ResolveInputSchema = z.union([z.object({ name: UsernameSchema }), z.object({ uuid: UuidSchema })]);
const PlayerInputSchema = z.object({ uuid: UuidSchema });
const RefreshInputSchema = z.object({ uuid: UuidSchema, clientIp: ClientIpSchema });
const LookupInputSchema = z.object({
  /** A username, or the UUID of a player URL that isn't stored. */
  name: z.union([UsernameSchema, UuidSchema]),
  clientIp: ClientIpSchema,
});
const SuggestInputSchema = z.object({ query: z.string().trim().max(16) });
const CardsInputSchema = z.object({ names: z.array(UsernameSchema).min(1).max(25) });

/** Query-string numbers arrive as strings. */
const PageNumber = z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).pipe(z.number().int());

const LeaderboardPageInputSchema = z.object({
  field: z.string().min(1).max(120),
  page: PageNumber.pipe(z.number().min(0)).default(0),
  size: PageNumber.pipe(z.number().min(1).max(50)).default(25),
  /** Show the page containing this player (UUID) and highlight them. */
  around: UuidSchema.optional(),
});

const errors = oc.errors({
  NOT_FOUND: { message: "Player not found" },
  /** `lookup` only: Hypixel didn't answer, so nothing is known about the name yet. */
  SERVICE_UNAVAILABLE: { message: "Hypixel didn't answer, try again shortly" },
  TOO_MANY_REQUESTS: {
    message: "Too many Hypixel lookups right now, try again shortly",
    data: z.object({
      /** Seconds until the per-IP or global budget frees up. */
      retryAfter: z.number(),
    }),
  },
});

/**
 * The site's API contract. GET procedures read Mongo and Redis only and are safe to cache at
 * the edge; the two POST procedures are the only ones that may call Hypixel and stay server-only.
 */
export const contract = {
  player: {
    resolve: errors
      .route({ method: "GET", path: "/player/resolve", summary: "Resolve a username or UUID" })
      .input(ResolveInputSchema)
      .output(PlayerIdentitySchema),
    page: errors
      .route({ method: "GET", path: "/player/page", summary: "The player page view model" })
      .input(PlayerInputSchema)
      .output(PlayerPageSchema),
    full: errors
      .route({ method: "GET", path: "/player/full", summary: "The stored player and guild documents" })
      .input(PlayerInputSchema)
      .output(PlayerFullSchema),
    refresh: errors
      .route({ method: "POST", path: "/player/refresh", summary: "Refresh a known player from Hypixel" })
      .input(RefreshInputSchema)
      .output(PlayerPageSchema),
    lookup: errors
      .route({ method: "POST", path: "/player/lookup", summary: "Look an unknown username or UUID up on Hypixel" })
      .input(LookupInputSchema)
      .output(PlayerIdentitySchema),
    bingo: errors
      .route({ method: "GET", path: "/player/bingo", summary: "The player's Bingo boards" })
      .input(PlayerInputSchema)
      .output(BingoPlayerSchema),
  },
  search: {
    suggest: oc
      .route({ method: "GET", path: "/search/suggest", summary: "Username autocomplete" })
      .input(SuggestInputSchema)
      .output(z.array(z.string()).max(25)),
    cards: oc
      .route({ method: "GET", path: "/search/cards", summary: "Result cards for a list of usernames" })
      .input(CardsInputSchema)
      .output(z.array(ResultCardSchema)),
  },
  leaderboard: {
    list: oc
      .route({ method: "GET", path: "/leaderboard/list", summary: "Every player leaderboard, grouped by game" })
      .output(z.array(LeaderboardGroupSchema)),
    page: errors
      .route({ method: "GET", path: "/leaderboard/page", summary: "One page of a player leaderboard" })
      .input(LeaderboardPageInputSchema)
      .output(LeaderboardPageSchema),
  },
  home: {
    previews: oc
      .route({ method: "GET", path: "/home/previews", summary: "The sample players, guild and leaderboard on the home page" })
      .output(HomePreviewsSchema),
  },
};

export type SiteContract = typeof contract;
export type SiteClient = ContractRouterClient<SiteContract>;

export type PlayerIdentity = z.infer<typeof PlayerIdentitySchema>;
export type PlayerPage = z.infer<typeof PlayerPageSchema>;
export type PlayerFull = z.infer<typeof PlayerFullSchema>;
export type GameSummary = z.infer<typeof GameSummarySchema>;
export type StatRow = z.infer<typeof StatRowSchema>;
export type ResultCard = z.infer<typeof ResultCardSchema>;
export type LeaderboardGroup = z.infer<typeof LeaderboardGroupSchema>;
export type LeaderboardRow = z.infer<typeof LeaderboardRowSchema>;
export type LeaderboardPage = z.infer<typeof LeaderboardPageSchema>;

/** Validated (server-side) inputs. */
export type ResolveInput = z.infer<typeof ResolveInputSchema>;
export type LeaderboardPageInput = z.infer<typeof LeaderboardPageInputSchema>;

export type BingoPlayer = z.infer<typeof BingoPlayerSchema>;
export type HomePreviews = z.infer<typeof HomePreviewsSchema>;
export type PreviewIdentity = z.infer<typeof PreviewIdentitySchema>;
export type BedWarsPreview = z.infer<typeof BedWarsPreviewSchema>;
export type SkyWarsPreview = z.infer<typeof SkyWarsPreviewSchema>;
export type DuelsPreview = z.infer<typeof DuelsPreviewSchema>;
export type ArcadePreview = z.infer<typeof ArcadePreviewSchema>;
export type GuildPreview = z.infer<typeof GuildPreviewSchema>;
export type GuildPreviewMember = z.infer<typeof GuildPreviewMemberSchema>;
