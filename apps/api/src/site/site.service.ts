/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as Sentry from "@sentry/node";
import { CacheLevel, GuildNotFoundException, GuildQuery, LeaderboardQuery, PlayerNotFoundException } from "@statsify/api-client";
import {
  Guild,
  type LeaderboardEnabledMetadata,
  Player,
  createHistoricalPlayer,
  deserialize,
  getLeaderboardField,
} from "@statsify/schemas";
import {
  HOME_PREVIEWS,
  arcadePreview,
  bedwarsPreview,
  duelsPreview,
  guildPreview,
  previewIdentity,
  skywarsPreview,
} from "./home-previews.js";
import { GuildService } from "#guild";
import { InjectModel } from "@m8a/nestjs-typegoose";
import { InjectRedis } from "#redis";
import { SessionService } from "#session";
import { HypixelUnavailableError } from "#hypixel";
import { Injectable, InternalServerErrorException, type OnApplicationBootstrap } from "@nestjs/common";
import type {
  BingoPlayer,
  GameInput,
  GamePage,
  Glossary,
  GuildPage,
  GuildPreview,
  GuildSuggestion,
  HomePreviews,
  LeaderboardGame,
  LeaderboardGameInput,
  LeaderboardGroup,
  LeaderboardPage,
  LeaderboardPageInput,
  GuildDocument,
  PlayerFull,
  PlayerIdentity,
  PlayerPage,
  PrestigeSheet,
  ResolveInput,
  ResultCard,
  SessionGameInput,
  SessionPage,
  Suggestion,
} from "@statsify/contract";
import { AUTO_UPDATE_AGE_MS, type AutoUpdate } from "@statsify/contract/refresh";
import { ORPCError } from "@orpc/nest";
import { buildGuildPage } from "./guild-page.js";
import { freshness } from "./cooldown.js";
import { siteName } from "./names.js";
import { buildGlossary, buildPrestigeSheet } from "./content.js";
import { LEADERBOARD_GROUPS, buildLeaderboardGroups, catalogGlossary, leaderboardColumn, leaderboardGame, leaderboardIndex } from "./leaderboards.js";
import { type PlayerGuild, buildPlayerPage, gameNav, gamePanels, sessionOverview } from "./player-page.js";
import { boardGamePage, buildGamePage, findGamePage, pageModes, pagePeriods, pageSubmodes } from "./game-pages/index.js";
import { PlayerLeaderboardService, PlayerSearchService, PlayerService } from "#player";
import { Redis } from "ioredis";
import { SkinService } from "#skin";
import { config, flatten, isUuid, normalizeUuid, removeFormatting } from "@statsify/util";
import { isIPv6 } from "node:net";
import type { ReturnModelType } from "@typegoose/typegoose";

type PlayerModel = ReturnModelType<typeof Player>;
type GuildModel = ReturnModelType<typeof Guild>;

/** How long the home previews are kept in Redis, or with a section missing, how soon they're built again. */
const HOME_PREVIEWS_KEY = "site:home:previews";
const HOME_PREVIEWS_TTL_SECONDS = 60;
const HOME_PREVIEWS_RETRY_SECONDS = 5;

/**
 * Usernames Minecraft's account servers or Hypixel answered have no such player, so a lookup doesn't ask again for a
 * while. A name that's only missing from the database isn't remembered: every name a visitor types would become a key.
 */
const MISS_TTL_SECONDS = 15 * 60;

/** Site-initiated Hypixel calls across all visitors per 5 minutes; `site.hypixelBudget` in `config.js`, 0 for none. */
const DEFAULT_HYPIXEL_BUDGET = 15;
const BUDGET_WINDOW_SECONDS = 5 * 60;
const BUDGET_KEY = "site:hypixel:budget";

/**
 * Site-initiated Hypixel calls per visitor address in the same 5 minutes, enough for a school or mobile network whose
 * visitors share one address.
 */
const IP_LIMIT = 10;
const IP_WINDOW_SECONDS = BUDGET_WINDOW_SECONDS;

const IDENTITY_FIELDS = { uuid: true, username: true, expiresAt: true };
const GUILD_FIELDS = {
  id: true,
  name: true,
  tag: true,
  tagFormatted: true,
  "members.uuid": true,
  "members.questParticipation": true,
  "members.daily": true,
  "members.weekly": true,
};
const CARD_FIELDS = {
  uuid: true,
  username: true,
  usernameToLower: true,
  displayName: true,
  rank: true,
  guildId: true,
  "stats.general.achievementPoints": true,
  "stats.general.karma": true,
  "stats.quests.total": true,
};

const missKey = (nameLower: string) => `site:miss:${nameLower}`;
const ipKey = (clientIp: string) => `site:ip:${rateLimitAddress(clientIp)}`;
// A game page's mode, submode or period in any case, as the game segment is (`?mode=SOLO`); the site redirects to the key.
const pageKey = <K extends string>(keys: readonly K[], key: string) => keys.find((known) => known.toLowerCase() === key.toLowerCase());

/**
 * The per-visitor bucket: an IPv4 address, or the /64 of an IPv6 one, since a single connection usually gets a
 * whole /64 and could otherwise pick a fresh address for every lookup.
 */
export function rateLimitAddress(clientIp: string): string {
  const ip = clientIp.split("%")[0];
  if (!isIPv6(ip)) return ip;

  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(ip);
  if (mapped) return mapped[1];

  const [head, tail] = ip.split("::");
  const left = head ? head.split(":") : [];
  const right = tail ? tail.split(":") : [];
  const zeros = Array.from({ length: 8 - left.length - right.length }, () => "0");
  const groups = tail === undefined ? left : [...left, ...zeros, ...right];

  return `${groups.slice(0, 4).map((group) => Number.parseInt(group, 16).toString(16)).join(":")}::/64`;
}

const notFound = (message = "Player not found") => new ORPCError("NOT_FOUND", { message });

/**
 * The page a game input asks for, or NOT_FOUND for a game, mode, submode or period the site doesn't have, on a session
 * (`session`) a mode its pages leave out too.
 */
function pageOf(input: GameInput, session = false) {
  const layout = findGamePage(input.game);
  if (!layout) throw notFound("Game not found");

  const modes = pageModes(layout, session).map(({ key }) => key);
  const mode = input.mode === undefined ? modes[0] : pageKey(modes, input.mode);
  if (mode === undefined) throw notFound("Mode not found");

  // A mode without submodes has no second page to ask for.
  const submodes = pageSubmodes(layout, mode) ?? [];
  const submode = input.submode === undefined ? undefined : pageKey(submodes, input.submode);
  if (input.submode !== undefined && submode === undefined) throw notFound("Mode not found");

  // A period the page has on another mode only (Monthly) gets this mode's first; one it never has is unknown.
  const periods = layout.periods?.(mode) ?? [];
  const asked = input.period === undefined ? undefined : pageKey(pagePeriods(layout), input.period);
  if (input.period !== undefined && asked === undefined) throw notFound("Period not found");
  const period = asked !== undefined && periods.includes(asked) ? asked : undefined;

  return { layout, mode, submode, period };
}

const hypixelUnavailable = () =>
  new ORPCError("SERVICE_UNAVAILABLE", { message: "Hypixel didn't answer, try again shortly" });

const tooManyRequests = (retryAfter: number) =>
  new ORPCError("TOO_MANY_REQUESTS", {
    message: "Too many Hypixel lookups right now, try again shortly",
    data: { retryAfter },
  });

const LEADERBOARD_LIST = buildLeaderboardGroups();
const GLOSSARY = buildGlossary(LEADERBOARD_LIST);
const PRESTIGE_SHEET = buildPrestigeSheet();

/**
 * Strict cache-only reads for the site. Nothing here calls Hypixel except `refresh`, `lookup`
 * and `lookupGuild`, which first pass the per-address and global budgets kept in Redis.
 */
@Injectable()
export class SiteService implements OnApplicationBootstrap {
  private readonly hypixelBudget = config("site.hypixelBudget", {
    required: false,
    default: DEFAULT_HYPIXEL_BUDGET,
  });

  public constructor(
    private readonly playerService: PlayerService,
    private readonly playerLeaderboardService: PlayerLeaderboardService,
    private readonly playerSearchService: PlayerSearchService,
    private readonly guildService: GuildService,
    private readonly sessionService: SessionService,
    private readonly skinService: SkinService,
    @InjectModel(Player) private readonly playerModel: PlayerModel,
    @InjectModel(Guild) private readonly guildModel: GuildModel,
    @InjectRedis() private readonly redis: Redis
  ) {}

  /** Builds the home previews once at start, without holding up the API's readiness. */
  public onApplicationBootstrap() {
    this.homePreviews().catch((error) => Sentry.captureException(error));
  }

  public async resolve(input: ResolveInput): Promise<PlayerIdentity> {
    if ("uuid" in input) {
      const player = await this.findIdentity("uuid", normalizeUuid(input.uuid));
      if (!player) throw notFound();
      return player;
    }

    const nameLower = input.name.toLowerCase();
    if (await this.redis.exists(missKey(nameLower))) throw notFound();

    const player = await this.findIdentity("usernameToLower", nameLower);

    if (!player) throw notFound();
    return player;
  }

  public async page(uuid: string): Promise<PlayerPage> {
    const player = await this.playerService.getStored(uuid);
    if (!player) throw notFound();
    return this.toPage(player);
  }

  public async full(uuid: string): Promise<PlayerFull> {
    const player = await this.playerService.getStored(uuid);
    if (!player) throw notFound();

    const document = player.guildId ? await this.findGuild(player.guildId) : null;
    const guild: GuildDocument | null = document && { ...document };

    return { player: { ...player }, guild };
  }

  public async refresh(uuid: string, clientIp: string, auto?: AutoUpdate): Promise<PlayerPage> {
    const tag = normalizeUuid(uuid);
    const cached = await this.playerService.getStored(tag);
    if (!cached) throw notFound();

    // Inside the API's own cooldown `CACHE` would not call Hypixel anyway, so it costs no budget. A stale page's update
    // can come from an edge copy of a page older than the stored save, so the stored save's age decides it.
    if (Date.now() < cached.expiresAt) return this.toPage(cached);
    if (auto === "stale" && Date.now() - freshness(cached).updatedAt < AUTO_UPDATE_AGE_MS) return this.toPage(cached);

    await this.consumeBudget(clientIp, auto !== undefined);
    const [player] = await Promise.all([this.playerService.get(tag, CacheLevel.CACHE), this.refreshSkin(tag)]);

    // When Hypixel doesn't answer, `PlayerService` hands back the stored player, still past its cooldown: say the
    // refresh failed rather than show the old stats as new.
    if (!player || player.expiresAt <= Date.now()) throw hypixelUnavailable();

    return this.toPage(player);
  }

  public async lookup(name: string, clientIp: string): Promise<PlayerIdentity> {
    const byUuid = isUuid(name);
    const tag = byUuid ? normalizeUuid(name) : name;
    const key = tag.toLowerCase();
    const known = await this.findIdentity(byUuid ? "uuid" : "usernameToLower", key);

    if (known) {
      await this.redis.del(missKey(key));
      return known;
    }

    // Asking again would get the same answer and spend budget.
    if ((await this.redis.get(missKey(key))) === "absent") throw notFound();

    const uuid = byUuid ? tag : await this.accountUuid(tag);

    if (!uuid) {
      await this.rememberMiss(key);
      throw notFound();
    }

    await this.consumeBudget(clientIp);

    let player: Player | null;

    try {
      [player] = await Promise.all([
        this.playerService.get(uuid, CacheLevel.CACHE, undefined, { throwOnHypixelError: true }),
        this.refreshSkin(uuid),
      ]);
    } catch (error) {
      // Not an answer about the name, so nothing is remembered and the visitor can try again.
      if (error instanceof HypixelUnavailableError) throw hypixelUnavailable();
      throw error;
    }

    if (!player) {
      await this.rememberMiss(key);
      throw notFound();
    }

    await this.redis.del(missKey(key));

    return { uuid: player.uuid, username: player.username, updatedAt: freshness(player).updatedAt };
  }

  /**
   * A guild the API hasn't stored, from Hypixel by name, within the same budgets as `lookup`: one call, with members
   * named from stored players only. Unlike `lookup` it keeps no miss.
   */
  public async lookupGuild(name: string, clientIp: string): Promise<{ name: string }> {
    const known: Pick<Guild, "name"> | null = await this.guildModel
      .findOne()
      .where("nameToLower")
      .equals(name.toLowerCase())
      .select({ _id: false, name: true })
      .lean()
      .exec();

    if (known) return known;

    await this.consumeBudget(clientIp);

    const lookup = this.guildService.get(name, GuildQuery.NAME, CacheLevel.CACHE, { namesFromHypixel: false, throwOnHypixelError: true });

    const guild = await lookup.catch((error: unknown) => {
      if (error instanceof GuildNotFoundException) return null;
      if (error instanceof HypixelUnavailableError) throw hypixelUnavailable();
      throw error;
    });

    if (!guild) throw notFound("Guild not found");
    return { name: guild.name };
  }

  /** Hypixel is asked by UUID: its name lookup is deprecated, and a typo then costs no budget. */
  private async accountUuid(name: string): Promise<string | null> {
    try {
      return await this.playerService.getUuid(name);
    } catch (error) {
      if (error instanceof PlayerNotFoundException) return null;
      // An account-server outage looks the same to the visitor as a Hypixel one.
      throw hypixelUnavailable();
    }
  }

  public async suggest(query: string): Promise<Suggestion[]> {
    if (!query) return [];
    const names = await this.playerSearchService.get(query);
    if (names.length === 0) return [];

    const players: Pick<Player, "usernameToLower" | "displayName">[] = await this.playerModel
      .find({ usernameToLower: { $in: names.map((name) => name.toLowerCase()) } })
      .select({ _id: false, usernameToLower: true, displayName: true })
      .lean()
      .exec();

    const displayNames = new Map(players.map((player) => [player.usernameToLower, player.displayName]));
    return names.map((name) => ({ name, displayName: displayNames.get(name.toLowerCase()) ?? null }));
  }

  /**
   * Stored guilds whose name starts with the query, alphabetically. A range on the `nameToLower` index rather than a
   * regex, so nothing typed needs escaping and the scan stops at the 25th.
   */
  public async suggestGuilds(query: string): Promise<GuildSuggestion[]> {
    if (!query) return [];
    const prefix = query.toLowerCase();

    return this.guildModel
      .find({ nameToLower: { $gte: prefix, $lt: `${prefix}\uffff` } })
      .sort({ nameToLower: 1 })
      .limit(25)
      .select({ _id: false, name: true, nameFormatted: true })
      .lean()
      .exec();
  }

  public async cards(names: string[]): Promise<ResultCard[]> {
    const namesLower = [...new Set(names.map((name) => name.toLowerCase()))];

    const documents: Player[] = await this.playerModel
      .find({ usernameToLower: { $in: namesLower } })
      .select(CARD_FIELDS)
      .lean()
      .exec();

    // Fields equal to their schema default aren't stored; `deserialize` fills them back in.
    const players = documents.map((document) => deserialize(Player, flatten(document)));

    const guildIds = [...new Set(players.flatMap((player) => (player.guildId ? [player.guildId] : [])))];

    const guilds: Pick<Guild, "id" | "tagFormatted">[] =
      guildIds.length > 0 ?
        await this.guildModel
          .find({ id: { $in: guildIds } })
          .select({ id: true, tagFormatted: true })
          .lean()
          .exec() :
        [];

    const tags = new Map(guilds.map((guild) => [guild.id, guild.tagFormatted]));
    const playersByName = new Map(players.map((player) => [player.usernameToLower, player]));

    return namesLower.flatMap((name) => {
      const player = playersByName.get(name);
      if (!player) return [];

      return [
        {
          uuid: player.uuid,
          username: player.username,
          displayName: player.displayName,
          rank: player.rank,
          guildTag: (player.guildId && tags.get(player.guildId)) || null,
          achievementPoints: player.stats.general.achievementPoints,
          quests: player.stats.quests.total,
          karma: player.stats.general.karma,
        },
      ];
    });
  }

  public async bingo(uuid: string): Promise<BingoPlayer> {
    const player = await this.playerService.getStored(uuid);
    if (!player) throw notFound();

    const { easy, hard } = player.stats.general.bingo;

    return {
      uuid: player.uuid,
      username: player.username,
      displayName: player.displayName,
      bingo: {
        easy: { casual: { ...easy.casual }, pvp: { ...easy.pvp }, classic: { ...easy.classic } },
        hard: { casual: { ...hard.casual }, pvp: { ...hard.pvp }, classic: { ...hard.classic } },
      },
      ...freshness(player),
    };
  }

  /** One mode (or submode) of a game's page; an unknown game, mode or submode is NOT_FOUND, like an unknown player. */
  public async game(input: GameInput): Promise<GamePage> {
    const { layout, mode, submode, period } = pageOf(input);
    const player = await this.playerService.getStored(input.uuid);
    if (!player) throw notFound();

    return { ...buildGamePage(player, layout, mode, submode, period), games: gameNav(player.stats) };
  }

  /** The games a player's session covers, as the player page's panels. */
  public async session(uuid: string): Promise<SessionPage> {
    const { player, gains, start } = await this.loadSession(uuid);
    return {
      uuid: player.uuid,
      username: player.username,
      displayName: player.displayName,
      start,
      overview: sessionOverview(gains),
      games: gamePanels(gains.stats, true),
      ...freshness(player),
    };
  }

  /** One mode of a game's page over a player's session: what they gained in it since the session started. */
  public async sessionGame(input: SessionGameInput): Promise<GamePage> {
    const { layout, mode, submode } = pageOf(input, true);
    const { player, gains, start } = await this.loadSession(input.uuid);

    return {
      ...buildGamePage(gains, layout, mode, submode, undefined, { session: true }),
      games: gameNav(gains.stats, true),
      session: { start },
      // The gains' own `expiresAt` is a difference too.
      ...freshness(player),
    };
  }

  /**
   * The player's session as a player of its own: each number what they gained since they last reset it with the bot's
   * `/session`, from the stored player, never Hypixel. NOT_FOUND "Session not found" when they never started one.
   */
  private async loadSession(uuid: string): Promise<{ player: Player; gains: Player; start: number }> {
    const [player, started] = await Promise.all([this.playerService.getStored(uuid), this.sessionService.getStored(uuid)]);
    if (!player) throw notFound();

    // `sessionReset` is in seconds.
    if (started?.sessionReset === undefined) throw notFound("Session not found");

    return { player, gains: createHistoricalPlayer(started, player), start: started.sessionReset * 1000 };
  }

  /** A stored guild by its name in any case. One the API has never fetched is NOT_FOUND, for `lookupGuild` to fetch. */
  public async guild(name: string): Promise<GuildPage> {
    const guild = await this.guildService.getStored(name, GuildQuery.NAME);
    if (!guild) throw notFound("Guild not found");
    return buildGuildPage(guild);
  }

  /** The home page's previews, each loaded on its own so one missing player hides one section. */
  public async homePreviews(): Promise<HomePreviews> {
    const cached = await this.redis.get(HOME_PREVIEWS_KEY);
    if (cached) return JSON.parse(cached) as HomePreviews;

    const previews = await this.buildHomePreviews();
    const complete = [...Object.values(previews.players), previews.guild, previews.leaderboard].every(Boolean);
    const ttl = complete ? HOME_PREVIEWS_TTL_SECONDS : HOME_PREVIEWS_RETRY_SECONDS;
    await this.redis.set(HOME_PREVIEWS_KEY, JSON.stringify(previews), "EX", ttl);

    return previews;
  }

  private async buildHomePreviews(): Promise<HomePreviews> {
    const [bedwars, skywars, duels, arcade, session, guild, leaderboard] = await Promise.all([
      this.preview(HOME_PREVIEWS.bedwars, bedwarsPreview),
      this.preview(HOME_PREVIEWS.skywars, skywarsPreview),
      this.preview(HOME_PREVIEWS.duels, duelsPreview),
      this.preview(HOME_PREVIEWS.arcade, arcadePreview),
      this.preview(HOME_PREVIEWS.session, previewIdentity),
      this.attempt(() => this.guildPreview(HOME_PREVIEWS.guildMember)),
      this.attempt(() => this.leaderboardPage({ field: HOME_PREVIEWS.leaderboard, page: 0, size: 3 })),
    ]);

    return { players: { bedwars, skywars, duels, arcade, session }, guild, leaderboard };
  }

  public leaderboardList(): LeaderboardGroup[] {
    return LEADERBOARD_LIST;
  }

  public glossary(): Glossary {
    return GLOSSARY;
  }

  public prestiges(): PrestigeSheet {
    return PRESTIGE_SHEET;
  }

  public leaderboardGame({ key }: LeaderboardGameInput): LeaderboardGame {
    const group = this.leaderboardList().find((group) => group.key === key);
    if (!group) throw notFound("Leaderboard not found");
    return leaderboardGame(group);
  }

  public async leaderboardPage(input: LeaderboardPageInput): Promise<LeaderboardPage> {
    const metadata = this.leaderboardMetadata(input.field);

    const leaderboard = await (input.around ?
      this.playerLeaderboardService.getLeaderboard(Player, input.field, input.around, LeaderboardQuery.INPUT, input.size) :
      this.playerLeaderboardService.getLeaderboard(Player, input.field, input.page, LeaderboardQuery.PAGE, input.size)
    ).catch((error: unknown) => {
      if (error instanceof PlayerNotFoundException) throw notFound("Player is not on this leaderboard");
      throw error;
    });

    // A row whose player document is gone has no name to show or link to.
    const rows = leaderboard.data.flatMap(({ id, username, fields, name, position, highlight }) =>
      username === undefined ? [] : [{ uuid: id, username, position, name, highlight, values: fields }]
    );

    // `fields` holds the columns' names, the board's own first unless it's hidden.
    const columnFields = [...(metadata.hidden ? [] : [input.field]), ...leaderboard.additionalFields];
    const columns = columnFields.map((field, i) => leaderboardColumn(field, leaderboard.fields[i] ?? ""));
    const index = leaderboardIndex(input.field);

    return {
      field: input.field,
      formatted: siteName(metadata.name),
      game: LEADERBOARD_GROUPS[input.field.split(".")[1]]?.game ?? null,
      glossary: catalogGlossary(input.field),
      columns,
      page: leaderboard.page,
      pages: leaderboard.pages,
      rows,
      gamePage: boardGamePage(input.field),
      index: index && { ...index, name: removeFormatting(this.leaderboardList().find(({ key }) => key === index.key)!.formatted) },
    };
  }

  private leaderboardMetadata(field: string): LeaderboardEnabledMetadata {
    try {
      return getLeaderboardField(Player, field);
    } catch {
      throw notFound("Leaderboard not found");
    }
  }

  private async findIdentity(field: "uuid" | "usernameToLower", value: string): Promise<PlayerIdentity | null> {
    const player: Pick<Player, "uuid" | "username" | "expiresAt"> | null = await this.playerModel
      .findOne()
      .where(field)
      .equals(value)
      .select(IDENTITY_FIELDS)
      .lean()
      .exec();

    return player && { uuid: player.uuid, username: player.username, updatedAt: freshness(player).updatedAt };
  }

  private async toPage(player: Player): Promise<PlayerPage> {
    const [guild, session] = await Promise.all([
      player.guildId ? this.findGuild(player.guildId) : null,
      this.sessionService.getStored(player.uuid, { sessionReset: true }),
    ]);

    // `sessionReset` is in seconds.
    const start = session?.sessionReset;
    return { ...buildPlayerPage(player, guild), session: start === undefined ? null : { start: start * 1000 } };
  }

  private findGuild(id: string): Promise<PlayerGuild | null> {
    return this.guildService.getStored(id, GuildQuery.ID, GUILD_FIELDS);
  }

  private preview<T>(uuid: string, build: (player: Player) => T): Promise<T | null> {
    return this.attempt(async () => {
      const player = await this.playerService.getStored(uuid);
      if (!player) throw new Error(`Home preview player ${uuid} is not stored`);
      return build(player);
    });
  }

  private async guildPreview(memberUuid: string): Promise<GuildPreview | null> {
    const member = await this.playerService.getStored(memberUuid, { guildId: true });
    if (!member?.guildId) return null;

    const guild = await this.guildService.getStored(member.guildId, GuildQuery.ID);
    return guild && guildPreview(guild, memberUuid);
  }

  /** A preview that fails to load is reported and hidden, instead of taking the whole home page down. */
  private async attempt<T>(load: () => Promise<T | null>): Promise<T | null> {
    try {
      return await load();
    } catch (error) {
      Sentry.captureException(error);
      return null;
    }
  }

  private rememberMiss(nameLower: string) {
    return this.redis.set(missKey(nameLower), "absent", "EX", MISS_TTL_SECONDS);
  }

  /**
   * The site's skins come from Minecraft's session server only here, within a refresh or lookup's budget slot; its skin
   * routes serve the stored one. A failed fetch leaves the stored skin, or Steve's, until the next refresh.
   */
  private async refreshSkin(uuid: string): Promise<void> {
    await this.skinService.getSkin(uuid).catch(() => undefined);
  }

  /**
   * Per-address, then global budget. A rejected call never eats into the global budget. With
   * `site.hypixelBudget: 0` every call is rejected here, before `PlayerService` runs. An automatic update (`auto`)
   * stops at two-thirds of the budget, so a third stays for clicks and for names the site has never stored.
   */
  private async consumeBudget(clientIp: string, auto = false): Promise<void> {
    const [attempts, ipTtl] = await this.hit(ipKey(clientIp), IP_WINDOW_SECONDS);
    if (attempts > IP_LIMIT) throw tooManyRequests(ipTtl);

    const budget = (await this.hypixelBudget) ?? DEFAULT_HYPIXEL_BUDGET;
    const limit = auto ? Math.floor((budget * 2) / 3) : budget;
    const [calls, budgetTtl] = await this.hit(BUDGET_KEY, BUDGET_WINDOW_SECONDS);

    if (calls > limit) {
      await this.redis.decr(BUDGET_KEY);
      throw tooManyRequests(budgetTtl);
    }
  }

  /**
   * Counts a hit in a fixed window that opens on the first hit; returns the count and the seconds left. The window's
   * key is created with its expiry in the same transaction as the count, so it can never be left without one.
   */
  private async hit(key: string, windowSeconds: number): Promise<[count: number, ttl: number]> {
    const results = await this.redis.multi().set(key, 0, "EX", windowSeconds, "NX").incr(key).ttl(key).exec();
    if (!results || results.some(([error]) => error)) throw new InternalServerErrorException();
    return [Number(results[1][1]), Number(results[2][1])];
  }
}

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it("buckets IPv6 visitors by /64", () => {
    expect(rateLimitAddress("203.0.113.7")).toBe("203.0.113.7");
    expect(rateLimitAddress("::ffff:203.0.113.7")).toBe("203.0.113.7");
    expect(rateLimitAddress("2001:db8:a:b:1:2:3:4")).toBe("2001:db8:a:b::/64");
    expect(rateLimitAddress("2001:0DB8:000A:000B::9")).toBe("2001:db8:a:b::/64");
    expect(rateLimitAddress("2001:db8::1")).toBe("2001:db8:0:0::/64");
  });
}
