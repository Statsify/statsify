/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Axios, { AxiosError, AxiosInstance } from "axios";
import { HypixelPlayerResponse } from "./types";
import { setTimeout } from "node:timers/promises";

export class HypixelKeyRejectedError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "EHYAPIKEY";
  }
}

export class HypixelAPIError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "EHYAPI";
  }
}

export type HypixelAPIConfig = {
  key: string;
  autoSleep: boolean;
};

export class HypixelAPI {
  public limit: number;
  public remaining: number;

  private axios: AxiosInstance;
  private config: HypixelAPIConfig;

  public constructor(config: HypixelAPIConfig) {
    this.axios = Axios.create({
      baseURL: "https://api.hypixel.net/",
      headers: { "API-KEY": config.key },
    });
    this.config = config;
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

  public guild(params: { id?: string; player?: string; name?: string }) {
    return this.get("guild", params);
  }

  public boosters() {
    return this.get("boosters");
  }

  public counts() {
    return this.get("counts");
  }

  public leaderboards() {
    return this.get("leaderboards");
  }

  public punishmentstats() {
    return this.get("punishmentstats");
  }

  public skyblockNews() {
    return this.get("skyblock/news");
  }

  public skyblockAuction(params: { uuid?: string; player?: string; profile?: string }) {
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

  public async getResource(
    resource:
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
      | "skyblock/bingo"
  ) {
    const response = await Axios.get(resource, {
      baseURL: "https://api.hypixel.net/resources/",
    });
    return response.data;
  }

  private async get<T>(
    endpoint: string,
    params?: Record<string, string | undefined>
  ): Promise<T | undefined> {
    try {
      const response = await this.axios.get(endpoint, { params });

      this.limit = Number(response.headers["rateLimit-limit"]);
      this.remaining = Number(response.headers["rateLimit-remaining"]);

      return response.data;
    } catch (error: any) {
      switch (error.code) {
        case 429: {
          if (this.config.autoSleep) {
            await setTimeout(
              Number((error as AxiosError)?.response?.headers?.["retry-after"] ?? 60) *
                1000
            );
            return await this.get(endpoint, params);
          } else {
            throw error;
          }
        }

        case 403: {
          throw new HypixelKeyRejectedError(
            `Hypixel API key "${this.config.key}" was rejected!`
          );
        }

        case 500: {
          throw new HypixelAPIError(
            "The Hypixel API has encountered an error with our request!"
          );
        }

        default: {
          throw error;
        }
      }
    }
  }
}
