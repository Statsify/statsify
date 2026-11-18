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
  SECTIONS,
  type SectionInput,
  findProfile,
  toMemberView,
  toProfileSummary,
  toProfilesView,
} from "@statsify/skyblock";
import { Singleflight } from "./singleflight.js";
import { SkyBlockMuseum, SkyBlockProfiles } from "./skyblock.model.js";
import { SkyBlockPricesService } from "./skyblock-prices.service.js";
import { unzip, zip } from "./zip.js";
import type {
  MemberView,
  PlayerRef,
  RawMuseum,
  RawProfile,
  SectionNeed,
  SkyBlockProfileView,
  SkyBlockProfilesView,
  SkyBlockSection,
} from "@statsify/skyblock";
import type { ReturnModelType } from "@typegoose/typegoose";

const FRESH_FOR = 300_000;
const LIVE_FLOOR = 60_000;
const FAILED_FOR = 60_000;
const SECTION_SECONDS = 300;
// Bump it when a section's shape changes, so a deploy never serves a section that older code cached
const SECTION_VERSION = 1;
const MAX_DOCUMENT = 15 * 1024 * 1024;

const DEFINITIONS = { ...SECTIONS, networth: NETWORTH } satisfies Record<SkyBlockSection, { needs: readonly SectionNeed[] }>;

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
  cache === CacheLevel.CACHE_ONLY || Date.now() - fetchedAt < (cache === CacheLevel.LIVE ? LIVE_FLOOR : FRESH_FOR);

type Unavailable = HypixelThrottledError | HypixelUnavailableError | BudgetError;

const isUnavailable = (error: unknown): error is Unavailable =>
  error instanceof HypixelThrottledError || error instanceof HypixelUnavailableError || error instanceof BudgetError;

function toUnavailable(error: Unavailable) {
  if (error instanceof HypixelThrottledError) return new SkyBlockUnavailableException("throttled", error.retryAfter);
  if (error instanceof BudgetError) return new SkyBlockUnavailableException("budget", error.retryAfter);
  return new SkyBlockUnavailableException("hypixel");
}

const timeOf = ({ fetchedAt }: { fetchedAt: number }) => new Date(fetchedAt).toISOString();

@Injectable()
export class SkyBlockService {
  private readonly logger = new Logger("SkyBlockService");
  private readonly singleflight = new Singleflight();

  public constructor(
    private readonly playerService: PlayerService,
    private readonly hypixelService: HypixelService,
    private readonly budgetService: SkyBlockBudgetService,
    private readonly pricesService: SkyBlockPricesService,
    @InjectModel(SkyBlockProfiles) private readonly profilesModel: ReturnModelType<typeof SkyBlockProfiles>,
    @InjectModel(SkyBlockMuseum) private readonly museumModel: ReturnModelType<typeof SkyBlockMuseum>,
    @InjectRedis() private readonly redis: Redis
  ) {}

  public async getProfiles(tag: string, cache: CacheLevel): Promise<SkyBlockProfilesView> {
    const { player, profiles, fetchedAt, stale } = await this.getPlayerProfiles(tag, cache);
    return toProfilesView(player, profiles, { fetchedAt, stale });
  }

  public async getProfile(
    tag: string,
    sections: SkyBlockSection[],
    cache: CacheLevel,
    profileName?: string
  ): Promise<SkyBlockProfileView> {
    const { player, profiles, fetchedAt, stale } = await this.getPlayerProfiles(tag, cache);

    const profile = findProfile(profiles, player.uuid, profileName);
    if (!profile) throw new SkyBlockNotFoundException("profile");
    const member = profile.members[player.uuid];

    const needs = new Set(sections.flatMap((name) => DEFINITIONS[name].needs));
    const [museum, prices, items] = await Promise.all([
      needs.has("museum") ? this.getStoredMuseum(profile.profile_id, cache) : undefined,
      needs.has("prices") ? this.pricesService.getPriceMap() : undefined,
      needs.has("items") ? this.pricesService.getItems() : undefined,
    ]);

    if ((needs.has("prices") && !prices) || (needs.has("items") && !items)) {
      throw new SkyBlockUnavailableException("market");
    }

    const input: SectionInput = {
      uuid: player.uuid,
      profile,
      member,
      museum: museum?.value.members?.[player.uuid],
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
        sections,
        (name) => this.getSection(name, input, fetchedAt, museum?.fetchedAt),
        museum?.value
      ),
      museumFetchedAt: museum?.fetchedAt,
    };
  }

  private async getPlayerProfiles(tag: string, cache: CacheLevel) {
    const player = await this.getPlayer(tag);
    const { value: profiles, fetchedAt, stale } = await this.getStoredProfiles(player.uuid, cache);
    if (!profiles) throw new SkyBlockNotFoundException("skyblock");

    return { player, profiles, fetchedAt, stale };
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
    if (cache === CacheLevel.CACHE_ONLY) throw new SkyBlockNotFoundException("skyblock");

    return this.refetch(`profiles:${uuid}`, stored, async () => {
      const profiles = await this.hypixelService.getSkyBlockProfiles(uuid);
      const fetchedAt = Date.now();

      const data = await this.compress(profiles, uuid);
      if (data) await this.profilesModel.replaceOne({ uuid }, { uuid, fetchedAt, data }, { upsert: true });

      return { value: profiles, fetchedAt };
    });
  }

  /** The museum is optional, so a lookup goes on without it when Hypixel or the budget refuses. */
  private async getStoredMuseum(profileId: string, cache: CacheLevel): Promise<Stored<RawMuseum> | undefined> {
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
      if (data) await this.museumModel.replaceOne({ profileId }, { profileId, fetchedAt, data }, { upsert: true });

      return { value: museum, fetchedAt };
    }).catch((error) => {
      if (error instanceof SkyBlockUnavailableException) return undefined;
      throw error;
    });
  }

  private async refetch<T>(
    key: string,
    stored: StoredCopy<T> | null,
    fetch: () => Promise<{ value: T; fetchedAt: number }>
  ): Promise<Stored<T>> {
    const failed = `skyblock:failed:${key}`;
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

      await this.redis.set(failed, "1", "PX", FAILED_FOR);
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

  /** A museum section is also keyed by the museum's copy, so one computed without it isn't served once it loads. */
  private async getSection(name: SkyBlockSection, input: SectionInput, fetchedAt: number, museumFetchedAt = 0) {
    const definition = DEFINITIONS[name];
    const version = definition.needs.includes("museum") ? `${fetchedAt}:${museumFetchedAt}` : fetchedAt;
    const key = `skyblock:section:v${SECTION_VERSION}:${input.uuid}:${input.profile.profile_id}:${name}:${version}`;
    const cached = await this.redis.getBuffer(key);
    if (cached) return unzip<MemberView[SkyBlockSection]>(cached);

    const section = await definition.compute(input);
    await this.redis.set(key, await zip(section), "EX", SECTION_SECONDS);
    return section;
  }
}
