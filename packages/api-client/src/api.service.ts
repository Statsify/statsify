/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as Sentry from "@sentry/node";
import Axios, { AxiosInstance, AxiosRequestHeaders, Method, ResponseType } from "axios";
import {
  CacheLevel,
  GuildQuery,
  LeaderboardQuery,
} from "./constants.js";
import {
  DeletePlayerResponse,
  GetCommandUsageResponse,
  GetGamecountsResponse,
  GetGuildResponse,
  GetGuildSearchResponse,
  GetKeyResponse,
  GetPlayerResponse,
  GetPlayerSearchResponse,
  GetSessionResponse,
  GetSkinTexturesResponse,
  GetStatusResponse,
  GetUserResponse,
  GetWatchdogResponse,
  PostGuildScopedPlayerLeaderboardResponse,
  PostLeaderboardRankingsResponse,
  PostLeaderboardResponse,
  PutUserBadgeResponse,
  SuccessResponse,
} from "#responses";
import { User, UserFooter, UserTheme } from "@statsify/schemas";
import { config } from "@statsify/util";
import { loadImage } from "@statsify/rendering";

interface ExtraData {
  headers?: AxiosRequestHeaders;
  body?: Record<string, any> | Buffer | string;
  responseType?: ResponseType;
}

interface AutocompleteCacheEntry {
  expiresAt: number;
  value: Promise<string[]>;
}

// TODO: Move dtos in api to @statsify/api-client
interface UpdateUser {
  serverMember?: boolean;
  theme?: UserTheme;
  footer?: UserFooter;
  locale?: string | null;
}

const isProduction = await config("environment") === "prod";
const AUTOCOMPLETE_CACHE_TTL = 15_000;
const AUTOCOMPLETE_CACHE_LIMIT = 250;

export class ApiService {
  private axios: AxiosInstance;
  private autocompleteCache = new Map<string, AutocompleteCacheEntry>();

  public constructor(private apiRoute: string, private apiKey: string) {
    this.axios = Axios.create({
      baseURL: this.apiRoute,
      headers: {
        "x-api-key": this.apiKey,
      },
      timeout: 10_000,
    });
  }

  public getCachedPlayer(tag: string, cache: CacheLevel) {
    return this.requestKey<GetPlayerResponse, "player">("/player", "player", {
      player: tag,
      cache,
    });
  }

  public deletePlayer(tag: string) {
    return this.request<DeletePlayerResponse>("/player", { player: tag }, "DELETE")
      .then(() => true)
      .catch(() => false);
  }

  public getStatus(tag: string) {
    return this.requestKey<GetStatusResponse, "status">("/player/status", "status", {
      player: tag,
    });
  }

  public getPlayerLeaderboard(
    field: string,
    input: string | number,
    type: LeaderboardQuery
  ): Promise<PostLeaderboardResponse | null> {
    return this.request<PostLeaderboardResponse>("/player/leaderboards", {}, "POST", {
      body: {
        field,
        [type === LeaderboardQuery.INPUT ? "player" : type]: input,
      },
    });
  }

  public getGuildScopedPlayerLeaderboard(
    guild: string,
    field: string,
    input: string | number,
    type: LeaderboardQuery
  ): Promise<PostGuildScopedPlayerLeaderboardResponse | null> {
    return this.request<PostGuildScopedPlayerLeaderboardResponse>(
      "/player/leaderboards/guild",
      {},
      "POST",
      {
        body: {
          guild,
          field,
          [type === LeaderboardQuery.INPUT ? "player" : type]: input,
        },
      }
    );
  }

  public getPlayerRankings(fields: string[], uuid: string, guild?: string) {
    return this.request<PostLeaderboardRankingsResponse[]>(
      "/player/leaderboards/rankings",
      {},
      "POST",
      { body: { fields, guild, uuid } }
    );
  }

  public getPlayerAutocomplete(query: string) {
    const normalizedQuery = query.trim().toLowerCase();

    return this.getCachedAutocomplete("player", normalizedQuery, () =>
      this.requestKey<GetPlayerSearchResponse, "players">(
        "/player/search",
        "players",
        normalizedQuery ? { query: normalizedQuery } : {}
      )
    );
  }

  public getGuildAutocomplete(query: string) {
    const normalizedQuery = query.trim().toLowerCase();

    const request = () =>
      this.requestKey<GetGuildSearchResponse, "guilds">(
        "/guild/search",
        "guilds",
        normalizedQuery ? { query: normalizedQuery } : {}
      );

    return this.getCachedAutocomplete("guild", normalizedQuery, request);
  }

  public getGuild(tag: string, type: GuildQuery) {
    return this.requestKey<GetGuildResponse, "guild">("/guild", "guild", {
      guild: tag,
      type,
    });
  }

  public getGuildLeaderboard(
    field: string,
    input: string | number,
    type: LeaderboardQuery
  ): Promise<PostLeaderboardResponse | null> {
    return this.request<PostLeaderboardResponse>("/guild/leaderboards", {}, "POST", {
      body: {
        field,
        [type === LeaderboardQuery.INPUT ? "guild" : type]: input,
      },
    });
  }

  public getGuildRankings(fields: string[], id: string) {
    return this.request<PostLeaderboardRankingsResponse[]>(
      "/guild/leaderboards/rankings",
      {},
      "POST",
      {
        body: { fields, id },
      }
    );
  }

  public async getWatchdog() {
    return this.requestKey<GetWatchdogResponse, "watchdog">(
      "/hypixelresources/watchdog",
      "watchdog"
    );
  }

  public async getGamecounts() {
    return this.requestKey<GetGamecountsResponse, "gamecounts">(
      "/hypixelresources/gamecounts",
      "gamecounts"
    );
  }

  public async getPlayerHead(uuid: string, size?: number) {
    return this.requestImage(
      isProduction ? "https://api.statsify.net/skin/head" : "/skin/head",
      {
        uuid,
        size,
      }
    );
  }

  public getPlayerSkin(uuid: string, user: User | null) {
    const route = User.hasExtrudedSkins(user) ? "skin/extruded" : "skin";
    return this.requestImage(isProduction ? `https://api.statsify.net/${route}` : `/${route}`, {
      uuid,
    });
  }

  public getPlayerSkinTextures(tag: string) {
    return this.requestKey<GetSkinTexturesResponse, "skin">("/skin/textures", "skin", {
      player: tag,
    });
  }

  public getPlayerSession(tag: string, userUuid?: string) {
    return this.requestKey<GetSessionResponse, "player">("/session", "player", {
      player: tag,
      userUuid,
    });
  }

  public resetPlayerSession(
    tag: string
  ) {
    return this.request<GetPlayerResponse>(
      "/session",
      { player: tag },
      "PATCH"
    );
  }

  public deletePlayerSession(
    id: string
  ) {
    return this.request<SuccessResponse>(
      "/session",
      { id },
      "DELETE"
    );
  }

  public getKey() {
    return this.requestKey<GetKeyResponse, "key">("/auth/key", "key");
  }

  public getUser(tag: string) {
    return this.request<GetUserResponse>("/user", { tag })
      .then((data) => data.user ?? null)
      .catch(() => null);
  }

  public updateUser(tag: string, update: UpdateUser) {
    return this.request<GetUserResponse>("/user", { tag }, "PATCH", { body: update })
      .then((data) => data.user ?? null)
      .catch(() => null);
  }

  public getUserBadge(tag: string) {
    return this.requestImage("/user/badge", { tag }).catch(() => undefined);
  }

  public updateUserBadge(tag: string, badge: Buffer) {
    return this.request<PutUserBadgeResponse>("user/badge", { tag }, "PUT", {
      body: badge,
      headers: { "Content-Type": "image/png" } as AxiosRequestHeaders,
    });
  }

  public deleteUserBadge(tag: string) {
    return this.request<PutUserBadgeResponse>("user/badge", { tag }, "DELETE");
  }

  public verifyUser(codeOrUuid: string, id: string) {
    return this.request<GetUserResponse>(
      "/user",
      { [codeOrUuid.length >= 32 ? "uuid" : "code"]: codeOrUuid, id },
      "PUT"
    )
      .then((data) => data.user ?? null)
      .catch(() => null);
  }

  public unverifyUser(tag: string) {
    return this.request<GetUserResponse>("/user", { tag }, "DELETE")
      .then((data) => data.user ?? null)
      .catch(() => null);
  }

  public getCommandUsage() {
    return this.requestKey<GetCommandUsageResponse, "usage">(
      "/commands",
      "usage",
      {}
    ).catch(() => null);
  }

  public incrementCommand(command: string) {
    return this.request("/commands", { command }, "PATCH");
  }

  private getCachedAutocomplete(
    namespace: string,
    query: string,
    request: () => Promise<string[]>
  ) {
    const normalizedQuery = query.trim().toLowerCase();

    const key = `${namespace}:${normalizedQuery}`;
    const cached = this.autocompleteCache.get(key);
    const now = Date.now();

    if (cached && cached.expiresAt > now) return cached.value;

    const value = request().catch(() => []);

    this.autocompleteCache.set(key, {
      value,
      expiresAt: now + AUTOCOMPLETE_CACHE_TTL,
    });

    if (this.autocompleteCache.size > AUTOCOMPLETE_CACHE_LIMIT) {
      const oldestKey = this.autocompleteCache.keys().next().value;
      if (oldestKey) this.autocompleteCache.delete(oldestKey);
    }

    return value;
  }

  private async requestKey<T, K extends keyof T>(
    url: string,
    key: K,
    params?: Record<string, unknown>,
    method: Method = "GET"
  ) {
    const data = await this.request<T>(url, params, method);

    if (data[key] === undefined || data[key] === null) {
      throw new Error(`Key not found: ${String(key)}`);
    }

    return data[key];
  }

  private async request<T>(
    url: string,
    params: Record<string, unknown> | undefined,
    method: Method = "GET",
    { body, headers, responseType }: ExtraData = {}
  ): Promise<T> {
    const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();

    const child = transaction?.startChild({
      op: "http.client",
      description: `${method} ${url}`,
    });

    const res = await this.axios.request({
      url,
      method,
      params,
      headers,
      data: body,
      responseType,
    });

    child?.setHttpStatus(res.status);
    child?.finish();

    const data = res.data;

    if (data.success === false) throw new Error("API request was unsuccessful");

    return data;
  }

  private async requestImage(url: string, params?: Record<string, unknown>) {
    const uri = this.axios.getUri({ url, params: { key: this.apiKey, ...params } });
    const image = await loadImage(uri);

    return image;
  }
}
