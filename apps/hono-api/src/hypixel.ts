/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as Sentry from "@sentry/node";
import { type APIData, config } from "@statsify/util";
import { GameCounts, Guild, Player, RecentGame, Status, Watchdog } from "@statsify/schemas";

const apiKey = config("hypixelApi.key");
const apiTimeout = config("hypixelApi.timeout");

export class Hypixel {
  // private readonly logger = new Logger("HypixelService");
  #resources = new Map<string, APIData>();

  static #instance: Hypixel | undefined = undefined;

  private constructor() {}

  // public shouldCache(expirey: number, cache: CacheLevel): boolean {
  //   return (
  //     cache !== CacheLevel.LIVE &&
  //     (cache == CacheLevel.CACHE_ONLY || Date.now() < expirey)
  //   );
  // }

  public async player(tag: string, kind: "uuid" | "name") {
    const data = await this.request("/player", { [kind]: tag });
    return data.player ? new Player(data.player) : undefined;
  }

  public async guild(tag: string, kind: "name" | "id" | "player") {
    const data = await this.request("/guild", { [kind]: tag });
    return data.guild ? new Guild(data.Guild) : undefined;
  }

  public async recentGames(uuid: string) {
    const data = await this.request("/recentgames", { uuid });
    return data.games ? data.games.map((game: APIData) => new RecentGame(game)) : [];
  }

  public async status(uuid: string) {
    const data = await this.request("/status", { uuid });
    return data.session ? new Status(data.session) : undefined;
  }

  public async watchdog() {
    const data = await this.request("/watchdogstats");
    return data ? new Watchdog(data) : undefined;
  }

  public async gameCounts() {
    const data = await this.request("/gamecounts");
    return data.games ? new GameCounts(data.games) : undefined;
  }

  public async resources(resourcePath: string, forceUpdate = false) {
    if (this.#resources.has(resourcePath) && !forceUpdate) return this.#resources.get(resourcePath);

    const resource = await this.request(`/resources/${resourcePath}`);
    if (resource) this.#resources.set(resourcePath, resource);

    return this.#resources.get(resourcePath);
  }

  private async request(path: `/${string}`, params?: Record<string, string>): Promise<APIData> {
    const searchParams = new URLSearchParams(params ?? {});
    const url = `https://api.hypixel.net/v2${path}?${searchParams.toString()}`;

    const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();

    const child = transaction?.startChild({
      op: "http.client",
      description: `GET ${url}`,
    });

    const signal = AbortSignal.timeout(apiTimeout);

    try {
      const response = await fetch(url, {
        headers: { "API-Key": apiKey },
        signal,
      });

      child?.setHttpStatus(response.status);

      if (!response.ok) {
        throw new Error(`Invalid response ${url} TODO`);
      }

      const body = await response.json();
      return body;
    } catch (error) {
      throw new Error(`Fetching ${path} failed`, { cause: error });
    } finally {
      child?.finish();
    }
  }

  public static instance(): Hypixel {
    if (!Hypixel.#instance) Hypixel.#instance = new Hypixel();
    return Hypixel.#instance;
  }
}

export const hypixel = Hypixel.instance();
