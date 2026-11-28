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
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@m8a/nestjs-typegoose";
import { InjectRedis } from "#redis";
import { Logger } from "@statsify/logger";
import { PlayerService } from "#player";
import { Redis } from "ioredis";
import { SkyBlockMuseum, SkyBlockProfiles } from "./skyblock.model.js";
import { SkyBlockPricesService } from "./skyblock-prices.service.js";
import {
  findProfile,
  getApiSettings,
  toProfileSummary,
  toProfilesView,
} from "@statsify/skyblock";
import { gunzipJson, gzipJson } from "./zip.js";
import type {
  MemberView,
  PlayerRef,
  RawMuseum,
  RawProfile,
  SectionInput,
  SkyBlockProfileView,
  SkyBlockProfilesView,
  SkyBlockSection,
} from "@statsify/skyblock";
import type { ReturnModelType } from "@typegoose/typegoose";

const FRESH_FOR = 300_000;
const LIVE_FLOOR = 60_000;
const FAILED_FOR = 60_000;
const SECTION_SECONDS = 300;
// Bump it when a section's shape changes, so a deploy never serves old ones.
const SECTION_VERSION = 1;
// Mongo caps a document at 16 MB, so a bigger response isn't stored.
const MAX_DOCUMENT = 15 * 1024 * 1024;

const isFresh = (fetchedAt: number, cache: CacheLevel) =>
  cache === CacheLevel.CACHE_ONLY ||
  Date.now() - fetchedAt < (cache === CacheLevel.LIVE ? LIVE_FLOOR : FRESH_FOR);

function toUnavailable(error: HypixelUnavailableError) {
  if (error instanceof HypixelThrottledError) {
    return new SkyBlockUnavailableException("throttled", error.retryAfter);
  }

  return new SkyBlockUnavailableException("hypixel");
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
});

@Injectable()
export class SkyBlockService {
  private readonly logger = new Logger("SkyBlockService");

  public constructor(
    private readonly playerService: PlayerService,
    private readonly hypixelService: HypixelService,
    private readonly pricesService: SkyBlockPricesService,
    @InjectModel(SkyBlockProfiles)
    private readonly profilesModel: ReturnModelType<typeof SkyBlockProfiles>,
    @InjectModel(SkyBlockMuseum)
    private readonly museumModel: ReturnModelType<typeof SkyBlockMuseum>,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  public async getProfiles(
    tag: string,
    cache: CacheLevel,
  ): Promise<SkyBlockProfilesView> {
    const { player, profiles, fetchedAt, stale } = await this.getPlayerProfiles(
      tag,
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
    const needs = new Set(sections.flatMap((name) => ALL_SECTIONS[name].needs));
    const [{ player, profiles, fetchedAt, stale }, prices, items] =
      await Promise.all([
        this.getPlayerProfiles(tag, cache),
        needs.has("prices") ? this.pricesService.getPriceMap() : undefined,
        needs.has("items") ? this.pricesService.getItems() : undefined,
      ]);

    const profile = findProfile(profiles, player.uuid, profileName);
    if (!profile) throw new SkyBlockNotFoundException("profile");
    const member = profile.members[player.uuid];

    if ((needs.has("prices") && !prices) || (needs.has("items") && !items)) {
      throw new SkyBlockUnavailableException("market");
    }

    const museum = needs.has("museum")
      ? await this.getMuseum(profile.profile_id, cache)
      : undefined;

    const input: SectionInput = {
      uuid: player.uuid,
      profile,
      member,
      museum: museum?.museum.members?.[player.uuid],
      prices,
      items,
    };

    const computed = await Promise.all(
      sections.map(async (name) => {
        const section = await this.getSection(
          name,
          input,
          fetchedAt,
          museum?.fetchedAt,
        );

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
    };
  }

  private async getPlayerProfiles(tag: string, cache: CacheLevel) {
    const player = await this.getPlayer(tag);
    const { profiles, fetchedAt, stale } = await this.getStoredProfiles(
      player.uuid,
      cache,
    );
    if (!profiles) throw new SkyBlockNotFoundException("skyblock");

    return { player, profiles, fetchedAt, stale };
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
      throw new SkyBlockNotFoundException("skyblock");
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
      }

      return { profiles, fetchedAt, stale: false };
    } catch (error) {
      if (!(error instanceof HypixelUnavailableError)) throw error;

      await this.recordFailure(key, error, stored?.fetchedAt);
      if (!stored) throw toUnavailable(error);
      return readProfiles(stored, true);
    }
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

      return { museum, fetchedAt };
    } catch (error) {
      if (!(error instanceof HypixelUnavailableError)) throw error;

      await this.recordFailure(key, error, stored?.fetchedAt);
      return stored ? readMuseum(stored) : undefined;
    }
  }

  private async failedRecently(key: string, storedAt: number) {
    const failed = await this.redis.exists(`skyblock:failed:${key}`);
    if (failed) {
      this.logger.warn(
        `Serving ${key} from ${toIsoTime(storedAt)}: a refetch failed under a minute ago`,
      );
    }

    return failed > 0;
  }

  private async recordFailure(key: string, error: Error, storedAt?: number) {
    await this.redis.set(`skyblock:failed:${key}`, "1", "PX", FAILED_FOR);

    const fallback =
      storedAt === undefined
        ? "no stored copy"
        : `serving the copy from ${toIsoTime(storedAt)}`;
    this.logger.warn(`Couldn't refetch ${key}: ${error.message}; ${fallback}`);
  }

  private async compress(response: unknown, id: string) {
    const data = await gzipJson(response);
    if (data.length > MAX_DOCUMENT) {
      this.logger.warn(
        `Not storing ${id}'s SkyBlock response: ${data.length} bytes gzipped`,
      );
      return;
    }

    return data;
  }

  // Keying on the museum's time stops a section made without it being reused.
  private async getSection(
    name: SkyBlockSection,
    input: SectionInput,
    fetchedAt: number,
    museumFetchedAt = 0,
  ) {
    const section = ALL_SECTIONS[name];
    const version = section.needs.includes("museum")
      ? `${fetchedAt}:${museumFetchedAt}`
      : fetchedAt;
    const key = `skyblock:section:v${SECTION_VERSION}:${input.uuid}:${input.profile.profile_id}:${name}:${version}`;

    const cached = await this.redis.getBuffer(key);
    if (cached) return gunzipJson<MemberView[SkyBlockSection]>(cached);

    const computed = await section.compute(input);
    await this.redis.set(key, await gzipJson(computed), "EX", SECTION_SECONDS);
    return computed;
  }
}
