/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as Sentry from "@sentry/node";
import { CacheLevel, PlayerNotFoundException } from "@statsify/api-client";
import {
  FormattedGame,
  type GameId,
  Guild,
  type LeaderboardEnabledMetadata,
  Player,
  deserialize,
  getLeaderboardField,
  getLeaderboardFields,
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
import { InjectModel } from "@m8a/nestjs-typegoose";
import { InjectRedis } from "#redis";
import { HypixelUnavailableError } from "#hypixel";
import { Injectable, InternalServerErrorException, type OnApplicationBootstrap } from "@nestjs/common";
import type {
  BingoPlayer,
  GameInput,
  GamePage,
  Glossary,
  GuildPreview,
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
} from "@statsify/contract";
import { ORPCError } from "@orpc/nest";
import { freshness } from "./cooldown.js";
import { buildGlossary, buildPrestigeSheet } from "./content.js";
import { catalogGlossary, catalogLabel, leaderboardColumn, leaderboardGame, leaderboardIndex } from "./leaderboards.js";
import { type PlayerGuild, buildPlayerPage, gameNav } from "./player-page.js";
import { boardGamePage, buildGamePage, findGamePage, pageModes, pagePeriods, pageSubmodes } from "./game-pages/index.js";
import { PlayerSearchService, PlayerService } from "#player";
import { SkinService } from "#skin";
import { Redis } from "ioredis";
import { config, flatten, removeFormatting } from "@statsify/util";
import { isIPv6 } from "node:net";
import type { ReturnModelType } from "@typegoose/typegoose";

type PlayerModel = ReturnModelType<typeof Player>;
type GuildModel = ReturnModelType<typeof Guild>;

/** How long the home previews are kept, or with a section missing, how soon they're built again. */
const HOME_PREVIEWS_TTL_MS = 60_000;
const HOME_PREVIEWS_RETRY_MS = 5000;

/**
 * Unknown usernames are remembered so repeated misses never reach Mongo again for a while: `stored` when the name
 * isn't in the database, `absent` when Mojang or Hypixel answered that there is no such player.
 */
const MISS_TTL_SECONDS = 15 * 60;
type Miss = "stored" | "absent";

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
const GUILD_FIELDS = { id: true, name: true, tag: true, tagFormatted: true };
/** What the player page and the general card read from the guild: its name and tag plus each member's quest and GEXP rows. */
const CARD_GUILD_FIELDS = {
  ...GUILD_FIELDS,
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
const normalizeUuid = (uuid: string) => uuid.replaceAll("-", "").toLowerCase();
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

const hypixelUnavailable = () =>
  new ORPCError("SERVICE_UNAVAILABLE", { message: "Hypixel didn't answer, try again shortly" });

const tooManyRequests = (retryAfter: number) =>
  new ORPCError("TOO_MANY_REQUESTS", {
    message: "Too many Hypixel lookups right now, try again shortly",
    data: { retryAfter },
  });

const gameGroup = (game: GameId) => ({ game, name: removeFormatting(FormattedGame[game]) });

/** `PlayerStats` keys → the leaderboard group they belong to. */
const LEADERBOARD_GROUPS: Record<string, { game: GameId | null; name: string }> = {
  arcade: gameGroup("ARCADE"),
  arenabrawl: gameGroup("ARENA_BRAWL"),
  bedwars: gameGroup("BEDWARS"),
  blitzsg: gameGroup("BLITZSG"),
  buildbattle: gameGroup("BUILD_BATTLE"),
  challenges: { game: null, name: "Challenges" },
  copsandcrims: gameGroup("COPS_AND_CRIMS"),
  duels: gameGroup("DUELS"),
  general: gameGroup("GENERAL"),
  megawalls: gameGroup("MEGAWALLS"),
  murdermystery: gameGroup("MURDER_MYSTERY"),
  paintball: gameGroup("PAINTBALL"),
  parkour: gameGroup("PARKOUR"),
  pit: gameGroup("PIT"),
  quake: gameGroup("QUAKE"),
  quests: { game: null, name: "Quests" },
  skywars: gameGroup("SKYWARS"),
  smashheroes: gameGroup("SMASH_HEROES"),
  speeduhc: gameGroup("SPEED_UHC"),
  tntgames: gameGroup("TNT_GAMES"),
  turbokartracers: gameGroup("TURBO_KART_RACERS"),
  uhc: gameGroup("UHC"),
  vampirez: gameGroup("VAMPIREZ"),
  walls: gameGroup("WALLS"),
  warlords: gameGroup("WARLORDS"),
  woolgames: gameGroup("WOOLGAMES"),
};

/** Every enabled player leaderboard, grouped by the `stats.<game>` it lives under. Static metadata. */
function buildLeaderboardGroups(): LeaderboardGroup[] {
  const groups = new Map<string, LeaderboardGroup>();

  for (const [field, { leaderboard }] of getLeaderboardFields(Player)) {
    const [root, statsKey] = field.split(".");
    if (root !== "stats" || !statsKey) continue;

    let group = groups.get(statsKey);

    if (!group) {
      group = { key: statsKey, ...(LEADERBOARD_GROUPS[statsKey] ?? { game: null, name: statsKey }), leaderboards: [] };
      groups.set(statsKey, group);
    }

    const label = catalogLabel(field);
    group.leaderboards.push({
      field,
      name: removeFormatting(leaderboard.name),
      ...(label && { label }),
      ...(leaderboard.enabled && leaderboard.aliases.length > 0 && { aliases: leaderboard.aliases }),
    });
  }

  return [...groups.values()];
}

/**
 * Strict cache-only reads for the site. Nothing here calls Hypixel except `refresh` and
 * `lookup`, which first pass the per-address and global budgets kept in Redis.
 */
@Injectable()
export class SiteService implements OnApplicationBootstrap {
  private readonly hypixelBudget = config("site.hypixelBudget", {
    required: false,
    default: DEFAULT_HYPIXEL_BUDGET,
  });

  private homeBuild?: Promise<HomePreviews>;
  private homeExpiresAt = 0;
  private leaderboardGroups?: LeaderboardGroup[];
  private glossarySheet?: Glossary;
  private prestigeSheet?: PrestigeSheet;

  public constructor(
    private readonly playerService: PlayerService,
    private readonly playerSearchService: PlayerSearchService,
    @InjectModel(Player) private readonly playerModel: PlayerModel,
    @InjectModel(Guild) private readonly guildModel: GuildModel,
    @InjectRedis() private readonly redis: Redis,
    private readonly skinService: SkinService
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

    if (!player) {
      await this.rememberMiss(nameLower, "stored");
      throw notFound();
    }

    return player;
  }

  public async page(uuid: string): Promise<PlayerPage> {
    const player = await this.loadPlayer(normalizeUuid(uuid));
    if (!player) throw notFound();
    return this.toPage(player);
  }

  public async full(uuid: string): Promise<PlayerFull> {
    const player = await this.loadPlayer(normalizeUuid(uuid));
    if (!player) throw notFound();

    const document = player.guildId ? await this.findGuild(player.guildId) : null;
    const guild: GuildDocument | null = document && { ...document };

    return { player: { ...player }, guild };
  }

  public async refresh(uuid: string, clientIp: string, auto = false): Promise<PlayerPage> {
    const tag = normalizeUuid(uuid);
    const cached = await this.loadPlayer(tag);
    if (!cached) throw notFound();

    // Inside the API's own cooldown `CACHE` would not call Hypixel anyway, so it costs no budget.
    if (Date.now() < cached.expiresAt) return this.toPage(cached);

    await this.consumeBudget(clientIp, auto);
    const player = await this.playerService.get(tag, CacheLevel.CACHE);

    // When Hypixel doesn't answer, `PlayerService` hands back the stored player, still past its cooldown: say the
    // refresh failed rather than show the old stats as new.
    if (!player || player.expiresAt <= Date.now()) throw hypixelUnavailable();

    return this.toPage(player);
  }

  public async lookup(name: string, clientIp: string): Promise<PlayerIdentity> {
    // A name has at most 16 characters, so anything longer is a UUID, as `PlayerService` tells them apart.
    const byUuid = name.length > 16;
    const tag = byUuid ? normalizeUuid(name) : name;
    const key = tag.toLowerCase();
    const known = await this.findIdentity(byUuid ? "uuid" : "usernameToLower", key);

    if (known) {
      await this.redis.del(missKey(key));
      return known;
    }

    // Mojang or Hypixel has already said there's no such player, so the answer is the same and costs no budget.
    if ((await this.redis.get(missKey(key))) === "absent") throw notFound();

    const uuid = byUuid ? tag : await this.mojangUuid(tag);

    if (!uuid) {
      await this.rememberMiss(key, "absent");
      throw notFound();
    }

    await this.consumeBudget(clientIp);

    let player: Player | null;

    try {
      player = await this.playerService.get(uuid, CacheLevel.CACHE, undefined, { throwOnHypixelError: true });
    } catch (error) {
      // Not an answer about the name, so nothing is remembered and the visitor can try again.
      if (error instanceof HypixelUnavailableError) throw hypixelUnavailable();
      throw error;
    }

    if (!player) {
      await this.rememberMiss(key, "absent");
      throw notFound();
    }

    await this.redis.del(missKey(key));

    return { uuid: player.uuid, username: player.username, updatedAt: freshness(player).updatedAt };
  }

  /**
   * A name's UUID from Mojang, or null when no account has it: a typo costs no Hypixel budget, and Hypixel is asked by
   * UUID, as its name lookup is deprecated.
   */
  private async mojangUuid(name: string): Promise<string | null> {
    try {
      return await this.skinService.getUuid(name);
    } catch (error) {
      if (error instanceof PlayerNotFoundException) return null;
      // To the visitor Mojang not answering is the same as Hypixel not answering: try again shortly.
      throw hypixelUnavailable();
    }
  }

  public async suggest(query: string): Promise<string[]> {
    if (!query) return [];
    return await this.playerSearchService.get(query);
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
    const player = await this.loadPlayer(normalizeUuid(uuid));
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
    const layout = findGamePage(input.game);
    if (!layout) throw notFound("Game not found");

    const modes = pageModes(layout).map(({ key }) => key);
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

    const player = await this.loadPlayer(normalizeUuid(input.uuid));
    if (!player) throw notFound();

    return { ...buildGamePage(player, layout, mode, submode, period), games: gameNav(player.stats) };
  }

  /** The home page's previews, each loaded on its own so one missing player hides one section. */
  public homePreviews(): Promise<HomePreviews> {
    if (this.homeBuild && Date.now() < this.homeExpiresAt) return this.homeBuild;

    // Callers share the build in flight; a failed one isn't kept, so the next call builds again.
    this.homeExpiresAt = Number.POSITIVE_INFINITY;
    this.homeBuild = this.buildHomePreviews().then(
      (previews) => {
        const complete = [...Object.values(previews.players), previews.guild, previews.leaderboard].every(Boolean);
        this.homeExpiresAt = Date.now() + (complete ? HOME_PREVIEWS_TTL_MS : HOME_PREVIEWS_RETRY_MS);
        return previews;
      },
      (error: unknown) => {
        this.homeBuild = undefined;
        throw error;
      }
    );

    return this.homeBuild;
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
    this.leaderboardGroups ??= buildLeaderboardGroups();
    return this.leaderboardGroups;
  }

  /** The glossary's stats; static metadata, like the leaderboard list it takes its game names from. */
  public glossary(): Glossary {
    this.glossarySheet ??= buildGlossary(this.leaderboardList());
    return this.glossarySheet;
  }

  /** The BedWars prestige sheet; code, so built once. */
  public prestiges(): PrestigeSheet {
    this.prestigeSheet ??= buildPrestigeSheet();
    return this.prestigeSheet;
  }

  public leaderboardGame({ key }: LeaderboardGameInput): LeaderboardGame {
    const group = this.leaderboardList().find((group) => group.key === key);
    if (!group) throw notFound("Leaderboard not found");
    return leaderboardGame(group);
  }

  public async leaderboardPage(input: LeaderboardPageInput): Promise<LeaderboardPage> {
    const metadata = this.leaderboardMetadata(input.field);
    const key = `player.${input.field}`;
    const { size } = input;

    let { page } = input;
    let highlight: number | undefined;

    if (input.around) {
      const uuid = normalizeUuid(input.around);
      const rank = await (metadata.sort === "ASC" ? this.redis.zrank(key, uuid) : this.redis.zrevrank(key, uuid));

      if (rank === null || rank >= metadata.limit) throw notFound("Player is not on this leaderboard");

      highlight = rank;
      page = Math.floor(rank / size);
    }

    const top = page * size;
    const bottom = Math.min(top + size, metadata.limit) - 1;

    const [total, entries] = await Promise.all([
      this.redis.zcard(key),
      bottom < top ?
        [] :
        (metadata.sort === "ASC" ?
          this.redis.zrange(key, top, bottom, "WITHSCORES") :
          this.redis.zrevrange(key, top, bottom, "WITHSCORES")),
    ]);

    const uuids: string[] = [];
    const scores: number[] = [];

    for (let i = 0; i < entries.length; i += 2) {
      uuids.push(entries[i]);
      scores.push(Number(entries[i + 1]));
    }

    const additionalFields = (metadata.additionalFields ?? []).filter((field) => field !== input.field);
    const additionalMetadata = additionalFields.map((field) => getLeaderboardField(Player, field, false));
    const { extraDisplay } = metadata;
    const extraDisplayMetadata = extraDisplay ? getLeaderboardField(Player, extraDisplay, false) : undefined;

    const stats = await this.additionalStats(uuids, [...additionalFields, ...(extraDisplay ? [extraDisplay] : [])]);

    const rows = uuids.map((uuid, index) => {
      const flat = stats.get(uuid) ?? {};
      let name = String(flat.displayName ?? uuid);

      if (extraDisplay) {
        const extra = flat[extraDisplay] ?? extraDisplayMetadata?.default;
        if (extra) name = `${String(extra)}§r ${name}`;
      }

      const values: (string | number)[] = [];
      if (!metadata.hidden) values.push(metadata.formatter ? metadata.formatter(scores[index]) : scores[index]);

      for (const [i, field] of additionalFields.entries()) {
        const fieldMetadata = additionalMetadata[i];
        const value = flat[field] ?? fieldMetadata.default;
        values.push(fieldMetadata.formatter ? fieldMetadata.formatter(value) : (value as string | number));
      }

      const username = String(flat.username ?? uuid);
      return { uuid, username, position: top + index + 1, name, highlight: top + index === highlight, values };
    });

    const columns = [
      ...(metadata.hidden ? [] : [leaderboardColumn(input.field, metadata.fieldName ?? "")]),
      ...additionalFields.map((field, i) => leaderboardColumn(field, additionalMetadata[i].fieldName ?? "")),
    ];
    const index = leaderboardIndex(input.field);

    return {
      field: input.field,
      name: removeFormatting(metadata.name),
      glossary: catalogGlossary(input.field),
      columns,
      sort: metadata.sort,
      page,
      pages: Math.ceil(Math.min(total, metadata.limit) / size),
      rows,
      gamePage: boardGamePage(input.field),
      index: index && { ...index, name: this.leaderboardList().find(({ key }) => key === index.key)!.name },
    };
  }

  private leaderboardMetadata(field: string): LeaderboardEnabledMetadata {
    try {
      return getLeaderboardField(Player, field);
    } catch {
      throw notFound("Leaderboard not found");
    }
  }

  /** One `$in` query for a whole leaderboard page, flattened for dotted field access. */
  private async additionalStats(uuids: string[], fields: string[]): Promise<Map<string, Record<string, unknown>>> {
    if (uuids.length === 0) return new Map();

    const selector: Record<string, boolean> = { uuid: true, username: true, displayName: true };
    for (const field of fields) selector[field] = true;

    const documents: { uuid: string }[] = await this.playerModel
      .find({ uuid: { $in: uuids } })
      .select(selector)
      .lean()
      .exec();

    return new Map(documents.map((document) => [document.uuid, flatten(document) as Record<string, unknown>]));
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

  /** The stored document, flattened for `deserialize` like `PlayerService` does, so defaults and ratios are filled in. */
  private async loadPlayer(uuid: string): Promise<Player | null> {
    const document: Player | null = await this.playerModel.findOne().where("uuid").equals(uuid).lean().exec();
    return document ? deserialize(Player, flatten(document)) : null;
  }

  private async toPage(player: Player): Promise<PlayerPage> {
    const guild = player.guildId ? await this.findGuild(player.guildId) : null;
    return buildPlayerPage(player, guild);
  }

  private async findGuild(id: string): Promise<PlayerGuild | null> {
    const document: Guild | null = await this.guildModel
      .findOne()
      .where("id")
      .equals(id)
      .select(CARD_GUILD_FIELDS)
      .lean()
      .exec();

    // Flattened for `deserialize` like `GuildService` does, so stored defaults come back as values.
    return document && deserialize(Guild, flatten(document));
  }

  private preview<T>(uuid: string, build: (player: Player) => T): Promise<T | null> {
    return this.attempt(async () => {
      const player = await this.loadPlayer(uuid);
      if (!player) throw new Error(`Home preview player ${uuid} is not stored`);
      return build(player);
    });
  }

  private async guildPreview(memberUuid: string): Promise<GuildPreview | null> {
    const member: Pick<Player, "guildId"> | null = await this.playerModel
      .findOne()
      .where("uuid")
      .equals(memberUuid)
      .select({ guildId: true })
      .lean()
      .exec();

    if (!member?.guildId) return null;

    const document: Guild | null = await this.guildModel.findOne().where("id").equals(member.guildId).lean().exec();
    return document && guildPreview(deserialize(Guild, flatten(document)), memberUuid);
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

  private rememberMiss(nameLower: string, miss: Miss) {
    return this.redis.set(missKey(nameLower), miss, "EX", MISS_TTL_SECONDS);
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
  const { it, expect, vi } = import.meta.vitest;

  it("refuses an automatic update once two-thirds of the budget is used, and lets a click through", async () => {
    // A stored player past their cooldown, 10 of the default 15 calls already spent, and Hypixel not answering.
    const query = { where: () => query, equals: () => query, lean: () => query, exec: async () => ({ uuid: "a", expiresAt: 0 }) };
    const counts: Record<string, number> = { [BUDGET_KEY]: 11 };
    const redis = {
      decr: vi.fn(),
      multi: vi.fn(() => ({
        set: (key: string) => ({ incr: () => ({ ttl: () => ({ exec: async () => [[null, "OK"], [null, counts[key] ?? 1], [null, 60]] }) }) }),
      })),
    };
    const playerService = { get: vi.fn(async () => null) };
    const stubs = [playerService, undefined, { findOne: () => query }, undefined, redis];
    const service = new SiteService(...(stubs as unknown as ConstructorParameters<typeof SiteService>));

    await expect(service.refresh("a", "203.0.113.7", true)).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
    expect(redis.decr).toHaveBeenCalledWith(BUDGET_KEY);
    expect(playerService.get).not.toHaveBeenCalled();

    await expect(service.refresh("a", "203.0.113.7")).rejects.toMatchObject({ code: "SERVICE_UNAVAILABLE" });
    expect(playerService.get).toHaveBeenCalledOnce();
  });

  it("buckets IPv6 visitors by /64", () => {
    expect(rateLimitAddress("203.0.113.7")).toBe("203.0.113.7");
    expect(rateLimitAddress("::ffff:203.0.113.7")).toBe("203.0.113.7");
    expect(rateLimitAddress("2001:db8:a:b:1:2:3:4")).toBe("2001:db8:a:b::/64");
    expect(rateLimitAddress("2001:0DB8:000A:000B::9")).toBe("2001:db8:a:b::/64");
    expect(rateLimitAddress("2001:db8::1")).toBe("2001:db8:0:0::/64");
  });
}
