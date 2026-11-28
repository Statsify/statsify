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
import {
  HypixelService,
  HypixelThrottledError,
  HypixelUnavailableError,
} from "#hypixel";
import { ALL_SECTIONS } from "@statsify/skyblock/networth";
import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { InjectModel } from "@m8a/nestjs-typegoose";
import { InjectRedis } from "#redis";
import { Logger } from "@statsify/logger";
import { PlayerService } from "#player";
import { Redis } from "ioredis";
import {
  SkyBlockGarden,
  SkyBlockMuseum,
  SkyBlockProfiles,
} from "./skyblock.model.js";
import { SkyBlockLeaderboardService } from "./leaderboards/skyblock-leaderboard.service.js";
import {
  FAILURE_BACKOFF_MS,
  SkyBlockPricesService,
} from "./skyblock-prices.service.js";
import {
  MEMBER_STATS_SECTIONS,
  findProfile,
  getApiSettings,
  getGameMode,
  isMember,
  toMemberStats,
  toProfileSummary,
  toProfilesView,
} from "@statsify/skyblock";
import { type SkyBlockStatsRow, skyblockStatsId } from "@statsify/schemas";
import { gunzipJson, gzipJson } from "./zip.js";
import { hasMuseum } from "@statsify/skyblock/display";
import type {
  MemberView,
  PlayerRef,
  PriceMap,
  RawGarden,
  RawMuseum,
  RawProfile,
  SectionInput,
  SectionNeed,
  SkyBlockProfileView,
  SkyBlockProfilesView,
  SkyBlockSection,
} from "@statsify/skyblock";
import type { Circular } from "@statsify/util";
import type { ReturnModelType } from "@typegoose/typegoose";

export const STORED_FRESH_MS = 300_000;
const LIVE_REUSE_MS = 60_000;
const SECTION_CACHE_SECONDS = 300;
// Bump it when a section's shape changes, so a deploy never serves old ones.
const SECTION_VERSION = 5;
// Mongo caps a document at 16 MB, so a bigger response isn't stored.
const MAX_DOCUMENT_BYTES = 15 * 1024 * 1024;
const STORED_COPIES = ["museum", "garden"] as const;

const isFresh = (fetchedAt: number, cache: CacheLevel) =>
  cache === CacheLevel.CACHE_ONLY ||
  Date.now() - fetchedAt <
    (cache === CacheLevel.LIVE ? LIVE_REUSE_MS : STORED_FRESH_MS);

function toUnavailable(error: HypixelUnavailableError) {
  if (error instanceof HypixelThrottledError) {
    return new SkyBlockUnavailableException("throttled", error.retryAfter);
  }

  return new SkyBlockUnavailableException("hypixel");
}

function getReadySections(
  sections: SkyBlockSection[],
  prices: PriceMap | undefined,
  items: unknown,
) {
  const built: Record<SectionNeed, boolean> = {
    museum: true,
    garden: true,
    prices: prices !== undefined,
    items: items !== undefined,
  };

  return sections.filter((name) =>
    ALL_SECTIONS[name].needs.every((need) => built[need]),
  );
}

const toIsoTime = (fetchedAt: number) => new Date(fetchedAt).toISOString();

const readProfiles = async (
  { data, fetchedAt }: SkyBlockProfiles,
  stale: boolean,
) => ({
  profiles: await gunzipJson<RawProfile[] | null>(data),
  fetchedAt,
  stale,
});

const readMuseum = async ({ data, fetchedAt }: SkyBlockMuseum) => ({
  museum: { members: await gunzipJson<RawMuseum["members"]>(data) },
  fetchedAt,
  newlyStored: false,
});

const readGarden = async ({ data, fetchedAt }: SkyBlockGarden) => ({
  garden: await gunzipJson<RawGarden | null>(data),
  fetchedAt,
});

const getFailureKey = (key: string) => `skyblock:failed:${key}`;

@Injectable()
export class SkyBlockService {
  private readonly logger = new Logger("SkyBlockService");

  public constructor(
    @Inject(forwardRef(() => PlayerService))
    private readonly playerService: Circular<PlayerService>,
    private readonly hypixelService: HypixelService,
    private readonly pricesService: SkyBlockPricesService,
    private readonly leaderboardService: SkyBlockLeaderboardService,
    @InjectModel(SkyBlockProfiles)
    private readonly profilesModel: ReturnModelType<typeof SkyBlockProfiles>,
    @InjectModel(SkyBlockMuseum)
    private readonly museumModel: ReturnModelType<typeof SkyBlockMuseum>,
    @InjectModel(SkyBlockGarden)
    private readonly gardenModel: ReturnModelType<typeof SkyBlockGarden>,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  // Museums and Gardens belong to the profile, so they stay.
  public async deletePlayer(uuid: string) {
    await Promise.all([
      this.profilesModel.deleteOne({ uuid }).exec(),
      this.leaderboardService.removePlayer(uuid),
    ]);
  }

  public async getProfiles(
    tag: string,
    cache: CacheLevel,
  ): Promise<SkyBlockProfilesView> {
    return this.getProfilesFor(await this.getPlayer(tag), cache);
  }

  // A caller that already has the player skips the player lookup.
  public async getProfilesFor(
    player: PlayerRef,
    cache: CacheLevel,
  ): Promise<SkyBlockProfilesView> {
    const { profiles, fetchedAt, stale } = await this.getPlayerProfiles(
      player,
      cache,
    );

    return toProfilesView(player, profiles, { fetchedAt, stale });
  }

  public async getProfile(
    tag: string,
    sections: SkyBlockSection[],
    cache: CacheLevel,
    profileName?: string,
  ): Promise<SkyBlockProfileView> {
    const player = await this.getPlayer(tag);
    return this.getProfileFor(player, sections, cache, profileName);
  }

  // With requireGarden, a Garden Hypixel can't send throws like the profiles.
  public async getProfileFor(
    player: PlayerRef,
    sections: SkyBlockSection[],
    cache: CacheLevel,
    profileName?: string,
    { requireGarden = false } = {},
  ): Promise<SkyBlockProfileView> {
    const needs = new Set(sections.flatMap((name) => ALL_SECTIONS[name].needs));
    const reads = {
      items: needs.has("items") ? this.pricesService.getItems() : undefined,
    };
    const [{ profiles, fetchedAt, stale }, prices, items] = await Promise.all([
      this.getPlayerProfiles(player, cache),
      needs.has("prices") ? this.pricesService.getPriceMap(reads) : undefined,
      reads.items,
    ]);

    const profile = findProfile(profiles, player.uuid, profileName);
    if (!profile) throw new SkyBlockNotFoundException("profile");
    const member = profile.members[player.uuid];

    const ready = getReadySections(sections, prices, items);
    const marketDown = sections.filter((name) => !ready.includes(name));
    if (ready.length === 0 && marketDown.length > 0) {
      throw new SkyBlockUnavailableException("market");
    }

    const [museum, garden] = await Promise.all([
      needs.has("museum") && hasMuseum(getGameMode(profile))
        ? this.getMuseum(profile.profile_id, cache).then((museum) => {
            // A stale copy is older than rows a co-op member may have written.
            if (museum?.newlyStored && !stale) {
              void this.rankMembers(
                player.uuid,
                profiles,
                fetchedAt,
                profile.profile_id,
              ).catch((error) => this.logger.error(error));
            }

            return museum;
          })
        : undefined,
      needs.has("garden")
        ? this.getGarden(profile.profile_id, cache, requireGarden)
        : undefined,
    ]);

    const input: SectionInput = {
      uuid: player.uuid,
      profile,
      member,
      museum: museum?.museum.members?.[player.uuid],
      garden: garden?.garden,
      prices,
      items: items?.parsed,
      rawItems: items?.raw,
    };

    const computed = await Promise.all(
      ready.map(async (name) => {
        const section = await this.getSection(name, input, fetchedAt, {
          museum: museum?.fetchedAt,
          garden: garden?.fetchedAt,
        });

        return [name, section] as const;
      }),
    );

    return {
      ...player,
      fetchedAt,
      stale,
      ...toProfileSummary(profile, player.uuid),
      member: {
        apiSettings: getApiSettings(profile, member, museum?.museum),
        ...Object.fromEntries(computed),
      },
      museumFetchedAt: museum?.fetchedAt,
      gardenFetchedAt: garden?.fetchedAt,
      ...(marketDown.length > 0 && { marketDown }),
    };
  }

  // undefined means a lookup would refetch now.
  public getNextRefetchAt(uuid: string): Promise<number | undefined> {
    return this.getRefetchAt(
      `profiles:${uuid}`,
      this.profilesModel.findOne({ uuid }, { fetchedAt: true }).exec(),
    );
  }

  public getNextGardenRefetchAt(
    profileId: string,
  ): Promise<number | undefined> {
    return this.getRefetchAt(
      `garden:${profileId}`,
      this.gardenModel.findOne({ profileId }, { fetchedAt: true }).exec(),
    );
  }

  private async getRefetchAt(
    key: string,
    document: Promise<{ fetchedAt: number } | null>,
  ) {
    const [stored, failedFor] = await Promise.all([
      document,
      this.redis.pttl(getFailureKey(key)),
    ]);

    if (!stored) return undefined;
    if (isFresh(stored.fetchedAt, CacheLevel.CACHE)) {
      return stored.fetchedAt + STORED_FRESH_MS;
    }

    return failedFor > 0 ? Date.now() + failedFor : undefined;
  }

  private async getPlayerProfiles(player: PlayerRef, cache: CacheLevel) {
    const { profiles, fetchedAt, stale } = await this.getStoredProfiles(
      player.uuid,
      cache,
    );
    if (!profiles) throw new SkyBlockNotFoundException("skyblock");

    return { profiles, fetchedAt, stale };
  }

  private async getPlayer(tag: string): Promise<PlayerRef> {
    const player = await this.playerService.get(tag, CacheLevel.CACHE_ONLY, {
      uuid: true,
      username: true,
      displayName: true,
    });
    if (!player) throw new PlayerNotFoundException();

    const { uuid, username, displayName } = player;
    return { uuid, username, displayName };
  }

  private async getStoredProfiles(uuid: string, cache: CacheLevel) {
    const key = `profiles:${uuid}`;
    const stored = await this.profilesModel.findOne({ uuid }).exec();

    if (stored && isFresh(stored.fetchedAt, cache)) {
      return readProfiles(stored, false);
    }

    if (cache === CacheLevel.CACHE_ONLY) {
      throw new SkyBlockNotFoundException("not_fetched");
    }

    if (stored && (await this.failedRecently(key, stored.fetchedAt))) {
      return readProfiles(stored, true);
    }

    try {
      const profiles = await this.hypixelService.getSkyBlockProfiles(uuid);
      const fetchedAt = Date.now();

      const data = await this.compress(profiles, uuid);
      if (data) {
        await this.profilesModel.replaceOne(
          { uuid },
          { uuid, fetchedAt, data },
          { upsert: true },
        );
        void this.rankMembers(uuid, profiles ?? [], fetchedAt).catch((error) =>
          this.logger.error(error),
        );
      }

      return { profiles, fetchedAt, stale: false };
    } catch (error) {
      if (!(error instanceof HypixelUnavailableError)) throw error;

      await this.recordFailure(key, error, stored?.fetchedAt);
      if (!stored) throw toUnavailable(error);
      return readProfiles(stored, true);
    }
  }

  // Ranking never fetches, and with a profileId only the player's row ranks.
  private async rankMembers(
    uuid: string,
    profiles: RawProfile[],
    fetchedAt: number,
    profileId?: string,
  ) {
    const ranked = profileId
      ? profiles.filter((profile) => profile.profile_id === profileId)
      : profiles;

    const items = this.pricesService.getItems();
    const [players, prices, loaded, museums] = await Promise.all([
      this.leaderboardService.getKnownPlayers(
        ranked.flatMap((profile) => Object.keys(profile.members)),
      ),
      this.pricesService.getPriceMap({ items }),
      items,
      Promise.all(
        ranked.map((profile) =>
          this.getMuseum(profile.profile_id, CacheLevel.CACHE_ONLY),
        ),
      ),
    ]);

    const ready = getReadySections(MEMBER_STATS_SECTIONS, prices, loaded);

    const removed = ranked.flatMap((profile) =>
      Object.keys(profile.members)
        .filter((member) => !isMember(profile, member))
        .map((member) => skyblockStatsId(member, profile.profile_id)),
    );

    const rows = await Promise.all(
      ranked.flatMap((profile, index) =>
        Object.entries(profile.members)
          .filter(
            ([member]) =>
              isMember(profile, member) &&
              players.has(member) &&
              (!profileId || member === uuid),
          )
          .map(async ([member, raw]): Promise<SkyBlockStatsRow> => {
            const input: SectionInput = {
              uuid: member,
              profile,
              member: raw,
              museum: museums[index]?.museum.members?.[member],
              prices,
              items: loaded?.parsed,
              rawItems: loaded?.raw,
            };

            const computed = await Promise.all(
              ready.map(
                async (name) =>
                  [name, await ALL_SECTIONS[name].compute(input)] as const,
              ),
            );
            const view: MemberView = {
              apiSettings: getApiSettings(profile, raw),
              ...Object.fromEntries(computed),
            };

            return {
              uuid: member,
              profileId: profile.profile_id,
              cuteName: profile.cute_name,
              gameMode: getGameMode(profile),
              fetchedAt,
              networthAsOf: view.networth?.pricesAsOf,
              boards: toMemberStats(input, view),
            };
          }),
      ),
    );

    // addMembers drops the player's rows on any profile it isn't given.
    await this.leaderboardService.addMembers(
      uuid,
      profiles.map((profile) => profile.profile_id),
      rows,
      removed,
    );
  }

  // The museum is optional, so a lookup goes on without it when Hypixel fails.
  private async getMuseum(profileId: string, cache: CacheLevel) {
    const key = `museum:${profileId}`;
    const stored = await this.museumModel.findOne({ profileId }).exec();

    if (stored && isFresh(stored.fetchedAt, cache)) return readMuseum(stored);
    if (cache === CacheLevel.CACHE_ONLY) return;

    if (stored && (await this.failedRecently(key, stored.fetchedAt))) {
      return readMuseum(stored);
    }

    try {
      const museum = await this.hypixelService.getSkyBlockMuseum(profileId);
      const fetchedAt = Date.now();

      const data = await this.compress(museum.members, profileId);
      if (data) {
        await this.museumModel.replaceOne(
          { profileId },
          { profileId, fetchedAt, data },
          { upsert: true },
        );
      }

      return { museum, fetchedAt, newlyStored: data !== undefined };
    } catch (error) {
      if (!(error instanceof HypixelUnavailableError)) throw error;

      await this.recordFailure(key, error, stored?.fetchedAt);
      return stored ? readMuseum(stored) : undefined;
    }
  }

  // A lookup goes on without the Garden unless the caller requires it.
  private async getGarden(
    profileId: string,
    cache: CacheLevel,
    required: boolean,
  ) {
    const key = `garden:${profileId}`;
    const stored = await this.gardenModel.findOne({ profileId }).exec();

    if (stored && isFresh(stored.fetchedAt, cache)) return readGarden(stored);
    if (cache === CacheLevel.CACHE_ONLY) return;

    if (stored && (await this.failedRecently(key, stored.fetchedAt))) {
      return readGarden(stored);
    }

    try {
      const garden = await this.hypixelService.getSkyBlockGarden(profileId);
      const fetchedAt = Date.now();

      const data = await this.compress(garden, profileId);
      if (data) {
        await this.gardenModel.replaceOne(
          { profileId },
          { profileId, fetchedAt, data },
          { upsert: true },
        );
      }

      return { garden, fetchedAt };
    } catch (error) {
      if (!(error instanceof HypixelUnavailableError)) throw error;

      await this.recordFailure(key, error, stored?.fetchedAt);
      if (!stored && required) throw toUnavailable(error);
      return stored ? readGarden(stored) : undefined;
    }
  }

  private async failedRecently(key: string, storedAt: number) {
    const failed = await this.redis.exists(getFailureKey(key));
    if (failed) {
      this.logger.warn(
        `Serving ${key} from ${toIsoTime(storedAt)}: a refetch failed under a minute ago`,
      );
    }

    return failed > 0;
  }

  private async recordFailure(key: string, error: Error, storedAt?: number) {
    await this.redis.set(getFailureKey(key), "1", "PX", FAILURE_BACKOFF_MS);

    const fallback =
      storedAt === undefined
        ? "no stored copy"
        : `serving the copy from ${toIsoTime(storedAt)}`;
    this.logger.warn(`Couldn't refetch ${key}: ${error.message}; ${fallback}`);
  }

  private async compress(response: unknown, id: string) {
    const data = await gzipJson(response);
    if (data.length > MAX_DOCUMENT_BYTES) {
      this.logger.warn(
        `Not storing ${id}'s SkyBlock response: ${data.length} bytes gzipped`,
      );
      return;
    }

    return data;
  }

  // Keying on each copy's time stops a section made without it being reused.
  private async getSection(
    name: SkyBlockSection,
    input: SectionInput,
    fetchedAt: number,
    copies: Partial<Record<(typeof STORED_COPIES)[number], number>>,
  ) {
    const section = ALL_SECTIONS[name];
    const copyTimes = STORED_COPIES.filter((copy) =>
      section.needs.includes(copy),
    ).map((copy) => copies[copy] ?? 0);
    const version = [fetchedAt, ...copyTimes].join(":");
    const key = `skyblock:section:v${SECTION_VERSION}:${input.uuid}:${input.profile.profile_id}:${name}:${version}`;

    const cached = await this.redis.getBuffer(key);
    if (cached) return gunzipJson<MemberView[SkyBlockSection]>(cached);

    const computed = await section.compute(input);
    await this.redis.set(
      key,
      await gzipJson(computed),
      "EX",
      SECTION_CACHE_SECONDS,
    );
    return computed;
  }
}
