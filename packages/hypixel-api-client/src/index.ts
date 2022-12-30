/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { HypixelPlayerResponse } from "./types";
import { setTimeout } from "node:timers/promises";

export class HypixelAPIError extends Error {
  public static BadRequest = new HypixelAPIError("Bad Request");
  public static InvalidAPIKey = new HypixelAPIError("Invalid API Key");
  public static NotFound = new HypixelAPIError("Not Found");
  public static InvalidData = new HypixelAPIError("Invalid Data");
  public static RatelimitExceeded = new HypixelAPIError("Ratelimit Exceeded");
  public static InternalServerError = new HypixelAPIError("Internal Server Error");
  public static DataUnavailable = new HypixelAPIError("Data Unavailable");
  public static UnknownError = new HypixelAPIError("Unknown Error");
  public static RequestTimeout = new HypixelAPIError("Request Timeout");

  public constructor(message: string) {
    super(message);
    this.name = HypixelAPIError.name;
  }

  public static fromCode(code: number) {
    switch (code) {
      case 400: {
        return HypixelAPIError.BadRequest;
      }
      case 403: {
        return HypixelAPIError.InvalidAPIKey;
      }
      case 404: {
        return HypixelAPIError.NotFound;
      }
      case 422: {
        return HypixelAPIError.InvalidData;
      }
      case 429: {
        return HypixelAPIError.RatelimitExceeded;
      }
      case 500: {
        return HypixelAPIError.InternalServerError;
      }
      case 503: {
        return HypixelAPIError.DataUnavailable;
      }
      default: {
        return HypixelAPIError.UnknownError;
      }
    }
  }
}

export interface HypixelAPIConfig {
  key: string;
  autoSleep: boolean;
  timeout?: number;
}

/**
 * ID - Guild ID
 * Player - Player UUID
 * Name - Guild name
 */
export type GuildQuery = { id: string } | { player: string } | { name: string };

/**
 * UUID - Auction UUID
 * Player - Player UUID
 * Profile - Profile UUID
 */
export type SkyblockAuctionQuery =
  | { uuid: string }
  | { player: string }
  | { profile: string };

export type Resource =
  | "games"
  | "achievements"
  | "challenges"
  | "quests"
  | "guilds/achievements"
  | "vanity/pets"
  | "vanity/companions"
  | "skyblock/collections"
  | "skyblock/skills"
  | "skyblock/items"
  | "skyblock/election"
  | "skyblock/bingo";

export class HypixelAPI {
  public limit: number;
  public remaining: number;
  public retryAfter?: number;

  public constructor(private config: HypixelAPIConfig) {
    this.limit = 120;
    this.remaining = this.limit;
  }

  public player(uuid: string): Promise<HypixelPlayerResponse | undefined> {
    return this.get<HypixelPlayerResponse>("player", { uuid });
  }

  public friends(uuid: string) {
    return this.get("friends", { uuid });
  }

  public recentgames(uuid: string) {
    return this.get("recentgames", { uuid });
  }

  public status(uuid: string) {
    return this.get("status", { uuid });
  }

  public guild(params: GuildQuery) {
    return this.get("guild", params);
  }

  public boosters() {
    return this.get("boosters");
  }

  public gamecounts() {
    return this.get("counts");
  }

  public leaderboards() {
    return this.get("leaderboards");
  }

  public watchdog() {
    return this.get("punishmentstats");
  }

  public skyblockNews() {
    return this.get("skyblock/news");
  }

  public skyblockAuction(params: SkyblockAuctionQuery) {
    return this.get("skyblock/auction", params);
  }

  public skyblockAuctions(page: number) {
    return this.get("skyblock/auctions", { page: `${page}` });
  }

  public skyblockAuctionsEnded() {
    return this.get("skyblock/auctions_ended");
  }

  public skyblockBazaar() {
    return this.get("skyblock/bazaar");
  }

  public skyblockProfile(profile: string) {
    return this.get("skyblock/profile", { profile });
  }

  public skyblockProfiles(uuid: string) {
    return this.get("skyblock/profiles", { uuid });
  }

  public skyblockBingo(uuid: string) {
    return this.get("skyblock/bingo", { uuid });
  }

  public skyblockFiresales() {
    return this.get("skyblock/firesales");
  }

  public async resource(resource: Resource) {
    return this.get(`resources/${resource}`);
  }

  /**
   *
   * @param endpoint The endpoint to fetch from https://api.hypixel.net/
   * @param params The query parameters to send
   * @returns The API response
   * @throws HypixelAPIError
   */
  private async get<T>(
    endpoint: string,
    params: Record<string, string> = {}
  ): Promise<T | undefined> {
    const controller = new AbortController();

    const url = new URL(
      `https://api.hypixel.net${endpoint}?${new URLSearchParams(params)}`
    );

    try {
      if (this.config.timeout) {
        setTimeout(this.config.timeout, controller.abort.bind(controller));
      }

      const response = await fetch(url, {
        headers: { "API-KEY": this.config.key },
        method: "GET",
        signal: controller.signal,
      });

      const headers = response.headers;
      const currentLimit = headers.get("rateLimit-limit");
      const currentRemaining = headers.get("rateLimit-remaining");
      const currentRetryAfter = headers.get("retry-after");

      this.limit = currentLimit ? +currentLimit : this.limit;
      this.remaining = currentRemaining ? +currentRemaining : this.remaining - 1;

      if (currentRetryAfter) this.retryAfter = +currentRetryAfter * 1000;
      if (!response.ok) throw HypixelAPIError.fromCode(response.status);

      this.retryAfter = undefined;

      const data = await response.json();
      return data;
    } catch (error: any) {
      if (error === HypixelAPIError.RatelimitExceeded && this.config.autoSleep) {
        const sleep = this.retryAfter ?? 60_000;
        await setTimeout(sleep);
        return this.get(endpoint, params);
      }

      this.retryAfter = undefined;

      if (error.name === "AbortError") throw HypixelAPIError.RequestTimeout;

      throw error;
    }
  }
}

export * from "./types";
