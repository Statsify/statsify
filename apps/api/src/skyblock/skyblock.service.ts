/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import {
  CacheLevel,
  PlayerNotFoundException,
  SkyBlockNotFoundException,
  SkyBlockUnavailableException,
} from "@statsify/api-client";
import { BudgetError, SkyBlockBudgetService } from "./skyblock-budget.service.js";
import { HypixelService, HypixelThrottledError, HypixelUnavailableError } from "#hypixel";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@m8a/nestjs-typegoose";
import { InjectRedis } from "#redis";
import { Logger } from "@statsify/logger";
import { NETWORTH } from "@statsify/skyblock/networth";
import { PlayerService } from "#player";
import { Redis } from "ioredis";
import {
  MEMBER_STATS_SECTIONS,
  SECTIONS,
  type SectionInput,
  findProfile,
  isMember,
  toMemberStats,
  toMemberView,
  toProfileSummary,
  toProfilesView,
} from "@statsify/skyblock";
import { Singleflight } from "./singleflight.js";
import { SkyBlockLeaderboardService } from "./leaderboards/skyblock-leaderboard.service.js";
import { SkyBlockGarden, SkyBlockMuseum, SkyBlockProfiles } from "./skyblock.model.js";
import { SKYBLOCK_FAILED_FOR, SkyBlockPricesService } from "./skyblock-prices.service.js";
import { unzip, zip } from "./zip.js";
import type {
  MemberView,
  PlayerRef,
  RawGarden,
  RawMuseum,
  RawProfile,
  SectionNeed,
  SkyBlockProfileView,
  SkyBlockProfilesView,
  SkyBlockSection,
} from "@statsify/skyblock";
import type { ReturnModelType } from "@typegoose/typegoose";
import type { SkyBlockStatsRow } from "@statsify/schemas";

/** How long a stored copy is new enough that a lookup at `CACHE` doesn't fetch it again. */
export const SKYBLOCK_FRESH_FOR = 300_000;
const LIVE_FLOOR = 60_000;
const SECTION_SECONDS = 300;
// Bump it when a section's shape changes, so a deploy never serves a section that older code cached
const SECTION_VERSION = 5;
const MAX_DOCUMENT = 15 * 1024 * 1024;

const DEFINITIONS = { ...SECTIONS, networth: NETWORTH } satisfies Record<SkyBlockSection, { needs: readonly SectionNeed[] }>;

const isReady = (name: SkyBlockSection, built: Record<SectionNeed, boolean>) => DEFINITIONS[name].needs.every((need) => built[need]);

interface Stored<T> {
  value: T;
  fetchedAt: number;
  stale: boolean;
}

/** A copy in Mongo, gunzipped only when it's served. */
interface StoredCopy<T> {
  fetchedAt: number;
  read: () => Promise<T>;
}

const serve = async <T>({ fetchedAt, read }: StoredCopy<T>, stale: boolean): Promise<Stored<T>> => ({
  value: await read(),
  fetchedAt,
  stale,
});

const isFresh = (fetchedAt: number, cache: CacheLevel) =>
  cache === CacheLevel.CACHE_ONLY || Date.now() - fetchedAt < (cache === CacheLevel.LIVE ? LIVE_FLOOR : SKYBLOCK_FRESH_FOR);

type Unavailable = HypixelThrottledError | HypixelUnavailableError | BudgetError;

const isUnavailable = (error: unknown): error is Unavailable =>
  error instanceof HypixelThrottledError || error instanceof HypixelUnavailableError || error instanceof BudgetError;

function toUnavailable(error: Unavailable) {
  if (error instanceof HypixelThrottledError) return new SkyBlockUnavailableException("throttled", error.retryAfter);
  if (error instanceof BudgetError) return new SkyBlockUnavailableException("budget", error.retryAfter);
  return new SkyBlockUnavailableException("hypixel");
}

const timeOf = ({ fetchedAt }: { fetchedAt: number }) => new Date(fetchedAt).toISOString();

const failedKey = (key: string) => `skyblock:failed:${key}`;

@Injectable()
export class SkyBlockService {
  private readonly logger = new Logger("SkyBlockService");
  private readonly singleflight = new Singleflight();
  private readonly rankings = new Map<string, Promise<void>>();

  public constructor(
    private readonly playerService: PlayerService,
    private readonly hypixelService: HypixelService,
    private readonly budgetService: SkyBlockBudgetService,
    private readonly pricesService: SkyBlockPricesService,
    private readonly leaderboardService: SkyBlockLeaderboardService,
    @InjectModel(SkyBlockProfiles) private readonly profilesModel: ReturnModelType<typeof SkyBlockProfiles>,
    @InjectModel(SkyBlockMuseum) private readonly museumModel: ReturnModelType<typeof SkyBlockMuseum>,
    @InjectModel(SkyBlockGarden) private readonly gardenModel: ReturnModelType<typeof SkyBlockGarden>,
    @InjectRedis() private readonly redis: Redis
  ) {}

  public async getProfiles(tag: string, cache: CacheLevel): Promise<SkyBlockProfilesView> {
    return this.getProfilesOf(await this.getPlayer(tag), cache);
  }

  /** For a caller that already knows the player, so the lookup never costs an identity call. */
  public async getProfilesOf(player: PlayerRef, cache: CacheLevel): Promise<SkyBlockProfilesView> {
    const { profiles, fetchedAt, stale } = await this.getPlayerProfiles(player, cache);
    return toProfilesView(player, profiles, { fetchedAt, stale });
  }

  public async getProfile(
    tag: string,
    sections: SkyBlockSection[],
    cache: CacheLevel,
    profileName?: string
  ): Promise<SkyBlockProfileView> {
    return this.getProfileOf(await this.getPlayer(tag), sections, cache, profileName);
  }

  /** With `requireGarden`, a Garden Hypixel or the budget refuses throws, as the profiles do, instead of being left out. */
  public async getProfileOf(
    player: PlayerRef,
    sections: SkyBlockSection[],
    cache: CacheLevel,
    profileName?: string,
    { requireGarden = false } = {}
  ): Promise<SkyBlockProfileView> {
    const { profiles, fetchedAt, stale } = await this.getPlayerProfiles(player, cache);

    const profile = findProfile(profiles, player.uuid, profileName);
    if (!profile) throw new SkyBlockNotFoundException("profile");
    const member = profile.members[player.uuid];

    const needs = new Set(sections.flatMap((name) => DEFINITIONS[name].needs));
    const [museum, garden, prices, items] = await Promise.all([
      // The rows ranked when these profiles were stored went without the museum a refetch here stores. A copy served
      // stale is older than rows a co-op partner's newer copy may have written, so it isn't ranked again. Bingo and
      // Stranded ("island") profiles have no museum.
      needs.has("museum") && !["bingo", "island"].includes(profile.game_mode ?? "") ?
        this.getStoredMuseum(
          profile.profile_id,
          cache,
          stale ? undefined : () => this.rankInBackground(player.uuid, profiles, fetchedAt, profile.profile_id)
        ) :
        undefined,
      needs.has("garden") ? this.getStoredGarden(profile.profile_id, cache, requireGarden) : undefined,
      needs.has("prices") ? this.pricesService.getPriceMap() : undefined,
      needs.has("items") ? this.pricesService.getItems() : undefined,
    ]);

    const built = { museum: true, garden: true, prices: !!prices, items: !!items };
    const ready = sections.filter((name) => isReady(name, built));
    const marketDown = sections.filter((name) => !ready.includes(name));
    if (ready.length === 0 && marketDown.length > 0) throw new SkyBlockUnavailableException("market");

    const input: SectionInput = {
      uuid: player.uuid,
      profile,
      member,
      museum: museum?.value.members?.[player.uuid],
      garden: garden?.value,
      prices,
      items,
    };

    return {
      ...player,
      fetchedAt,
      stale,
      ...toProfileSummary(profile, player.uuid),
      member: await toMemberView(
        input,
        ready,
        (name) => this.getSection(name, input, fetchedAt, { museum: museum?.fetchedAt, garden: garden?.fetchedAt }),
        museum?.value
      ),
      museumFetchedAt: museum?.fetchedAt,
      gardenFetchedAt: garden?.fetchedAt,
      ...(marketDown.length > 0 && { marketDown }),
    };
  }

  /** When a lookup at `CACHE` can next call Hypixel for the player's profiles, or undefined when it would now. */
  public async nextRefetchAt(uuid: string): Promise<number | undefined> {
    const document = await this.profilesModel.findOne({ uuid }, { fetchedAt: true }).exec();
    return this.nextRefetchOf(`profiles:${uuid}`, document?.fetchedAt);
  }

  /** The same for a profile's Garden, which only a lookup that needs it fetches. */
  public async nextGardenRefetchAt(profileId: string): Promise<number | undefined> {
    const document = await this.gardenModel.findOne({ profileId }, { fetchedAt: true }).exec();
    return this.nextRefetchOf(`garden:${profileId}`, document?.fetchedAt);
  }

  private async nextRefetchOf(key: string, fetchedAt?: number) {
    if (fetchedAt === undefined) return undefined;
    if (isFresh(fetchedAt, CacheLevel.CACHE)) return fetchedAt + SKYBLOCK_FRESH_FOR;

    const failedFor = await this.redis.pttl(failedKey(key));
    return failedFor > 0 ? Date.now() + failedFor : undefined;
  }

  private async getPlayerProfiles(player: PlayerRef, cache: CacheLevel) {
    const { value: profiles, fetchedAt, stale } = await this.getStoredProfiles(player.uuid, cache);
    if (!profiles) throw new SkyBlockNotFoundException("skyblock");

    return { profiles, fetchedAt, stale };
  }

  private async getPlayer(tag: string): Promise<PlayerRef> {
    const selector = { uuid: true, username: true, displayName: true };
    let player = await this.playerService.findMongoDocument(tag, selector);

    if (!player) {
      await this.budgetService.take().catch((error) => {
        if (!(error instanceof BudgetError)) throw error;
        this.logger.warn(`Couldn't look up ${tag}: ${error.message}`);
        throw toUnavailable(error);
      });

      player = await this.playerService.get(tag, CacheLevel.CACHE_ONLY, selector);
    }

    if (!player) throw new PlayerNotFoundException();
    return { uuid: player.uuid, username: player.username, displayName: player.displayName };
  }

  private async getStoredProfiles(uuid: string, cache: CacheLevel): Promise<Stored<RawProfile[] | null>> {
    const document = await this.profilesModel.findOne({ uuid }).exec();
    const stored = document && { fetchedAt: document.fetchedAt, read: () => unzip<RawProfile[] | null>(document.data) };

    if (stored && isFresh(stored.fetchedAt, cache)) return serve(stored, false);
    if (cache === CacheLevel.CACHE_ONLY) throw new SkyBlockNotFoundException("not_fetched");

    return this.refetch(`profiles:${uuid}`, stored, async () => {
      const profiles = await this.hypixelService.getSkyBlockProfiles(uuid);
      const fetchedAt = Date.now();

      const data = await this.compress(profiles, uuid);
      if (data) {
        await this.profilesModel.replaceOne({ uuid }, { uuid, fetchedAt, data }, { upsert: true });
        this.rankInBackground(uuid, profiles ?? [], fetchedAt);
      }

      return { value: profiles, fetchedAt };
    });
  }

  /**
   * Not awaited, so a failed write never fails the lookup. A player's rankings run in order, so one profile's rows
   * ranked with its new museum land after the whole copy's rows ranked without it.
   */
  private rankInBackground(uuid: string, profiles: RawProfile[], fetchedAt: number, profileId?: string) {
    const ranking = (this.rankings.get(uuid) ?? Promise.resolve())
      .then(() => this.rankMembers(uuid, profiles, fetchedAt, profileId))
      .catch((error) => this.logger.error(error));

    this.rankings.set(uuid, ranking);
    void ranking.finally(() => {
      if (this.rankings.get(uuid) === ranking) this.rankings.delete(uuid);
    });
  }

  /**
   * The leaderboard rows of a copy just stored, for every current member Statsify has a player record for, with the
   * stored museums and the prices of the hour; only `profileId`'s when given. It never fetches.
   */
  private async rankMembers(uuid: string, profiles: RawProfile[], fetchedAt: number, profileId?: string) {
    const ranked = profileId ? profiles.filter((profile) => profile.profile_id === profileId) : profiles;

    const [players, prices, items, museums] = await Promise.all([
      this.leaderboardService.knownPlayers(ranked.flatMap((profile) => Object.keys(profile.members))),
      this.pricesService.getPriceMap(),
      this.pricesService.getItems(),
      Promise.all(ranked.map((profile) => this.getStoredMuseum(profile.profile_id, CacheLevel.CACHE_ONLY))),
    ]);

    const built = { museum: true, garden: true, prices: !!prices, items: !!items };
    const ready = MEMBER_STATS_SECTIONS.filter((name) => isReady(name, built));

    const removed = ranked.flatMap((profile) =>
      Object.keys(profile.members)
        .filter((member) => !isMember(profile, member))
        .map((member) => `${member}:${profile.profile_id}`)
    );

    const rows = await Promise.all(
      ranked.flatMap((profile, index) =>
        Object.entries(profile.members)
          .filter(([member]) => isMember(profile, member) && players.has(member))
          .map(async ([member, raw]): Promise<SkyBlockStatsRow> => {
            const museum = museums[index]?.value.members?.[member];
            const input: SectionInput = { uuid: member, profile, member: raw, museum, prices, items };
            const view = await toMemberView(input, ready, (name) => DEFINITIONS[name].compute(input));
            const summary = toProfileSummary(profile, member);

            return {
              uuid: member,
              profileId: profile.profile_id,
              cuteName: summary.cuteName,
              gameMode: summary.gameMode,
              fetchedAt,
              networthAsOf: view.networth?.pricesAsOf,
              boards: toMemberStats(input, view),
            };
          })
      )
    );

    // Every profile's id, not only the ranked ones: addMembers drops the player's rows on profiles it isn't given
    await this.leaderboardService.addMembers(uuid, profiles.map((profile) => profile.profile_id), rows, removed);
  }

  /** The museum is optional, so a lookup goes on without it when Hypixel or the budget refuses. */
  private async getStoredMuseum(profileId: string, cache: CacheLevel, onStored?: () => void): Promise<Stored<RawMuseum> | undefined> {
    const document = await this.museumModel.findOne({ profileId }).exec();
    const stored = document && {
      fetchedAt: document.fetchedAt,
      read: async (): Promise<RawMuseum> => ({ members: await unzip<RawMuseum["members"]>(document.data) }),
    };

    if (stored && isFresh(stored.fetchedAt, cache)) return serve(stored, false);
    if (cache === CacheLevel.CACHE_ONLY) return undefined;

    return this.refetch(`museum:${profileId}`, stored, async () => {
      const museum = await this.hypixelService.getSkyBlockMuseum(profileId);
      const fetchedAt = Date.now();

      const data = await this.compress(museum.members, profileId);
      if (data) {
        await this.museumModel.replaceOne({ profileId }, { profileId, fetchedAt, data }, { upsert: true });
        onStored?.();
      }

      return { value: museum, fetchedAt };
    }).catch((error) => {
      if (error instanceof SkyBlockUnavailableException) return undefined;
      throw error;
    });
  }

  /** A stored null is Hypixel's 404: the profile has no Garden, until a refetch finds one. */
  private async getStoredGarden(
    profileId: string,
    cache: CacheLevel,
    required: boolean
  ): Promise<Stored<RawGarden | null> | undefined> {
    const document = await this.gardenModel.findOne({ profileId }).exec();
    const stored = document && { fetchedAt: document.fetchedAt, read: () => unzip<RawGarden | null>(document.data) };

    if (stored && isFresh(stored.fetchedAt, cache)) return serve(stored, false);
    if (cache === CacheLevel.CACHE_ONLY) return undefined;

    return this.refetch(`garden:${profileId}`, stored, async () => {
      const garden = await this.hypixelService.getSkyBlockGarden(profileId);
      const fetchedAt = Date.now();

      const data = await this.compress(garden, profileId);
      if (data) await this.gardenModel.replaceOne({ profileId }, { profileId, fetchedAt, data }, { upsert: true });

      return { value: garden, fetchedAt };
    }).catch((error) => {
      if (!required && error instanceof SkyBlockUnavailableException) return undefined;
      throw error;
    });
  }

  private async refetch<T>(
    key: string,
    stored: StoredCopy<T> | null,
    fetch: () => Promise<{ value: T; fetchedAt: number }>
  ): Promise<Stored<T>> {
    const failed = failedKey(key);
    if (stored && (await this.redis.exists(failed))) {
      this.logger.warn(`Serving ${key} from ${timeOf(stored)}: a refetch failed under a minute ago`);
      return serve(stored, true);
    }

    try {
      return await this.singleflight.run(key, async () => {
        await this.budgetService.take();
        return { ...(await fetch()), stale: false };
      });
    } catch (error) {
      if (!isUnavailable(error)) throw error;

      await this.redis.set(failed, "1", "PX", SKYBLOCK_FAILED_FOR);
      this.logger.warn(
        `Couldn't refetch ${key}: ${error.message}; ${stored ? `serving the copy from ${timeOf(stored)}` : "no stored copy"}`
      );

      if (stored) return serve(stored, true);
      throw toUnavailable(error);
    }
  }

  /** Mongo caps a document at 16 MB, so a bigger response isn't stored and the next miss refetches. */
  private async compress(response: unknown, id: string) {
    const data = await zip(response);
    if (data.length > MAX_DOCUMENT) {
      this.logger.warn(`Not storing ${id}'s SkyBlock response: ${data.length} bytes gzipped`);
      return;
    }

    return data;
  }

  /** A section that needs the museum or the Garden is also keyed by that copy, so one computed without it isn't served once it loads. */
  private async getSection(
    name: SkyBlockSection,
    input: SectionInput,
    fetchedAt: number,
    copies: Partial<Record<"museum" | "garden", number>>
  ) {
    const definition = DEFINITIONS[name];
    const needs: readonly SectionNeed[] = definition.needs;
    const keyedBy = (["museum", "garden"] as const).filter((need) => needs.includes(need));
    const version = [fetchedAt, ...keyedBy.map((need) => copies[need] ?? 0)].join(":");
    const key = `skyblock:section:v${SECTION_VERSION}:${input.uuid}:${input.profile.profile_id}:${name}:${version}`;
    const cached = await this.redis.getBuffer(key);
    if (cached) return unzip<MemberView[SkyBlockSection]>(cached);

    const section = await definition.compute(input);
    await this.redis.set(key, await zip(section), "EX", SECTION_SECONDS);
    return section;
  }
}
