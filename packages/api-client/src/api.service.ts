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
  DeletePlayerResponse,
  GetFriendsResponse,
  GetGamecountsResponse,
  GetGuildResponse,
  GetHistoricalResponse,
  GetKeyResponse,
  GetPlayerResponse,
  GetRecentGamesResponse,
  GetStatusResponse,
  GetUserResponse,
  GetWatchdogResponse,
  PostLeaderboardRankingsResponse,
  PostLeaderboardResponse,
  PutUserBadgeResponse,
} from "./responses";
import { GuildQuery, HistoricalType, HypixelCache, LeaderboardQuery } from "./enums";
import { UserTheme } from "@statsify/schemas";
import { loadImage } from "@statsify/rendering";

interface ExtraData {
  headers?: AxiosRequestHeaders;
  body?: Record<string, any> | Buffer | string;
  responseType?: ResponseType;
}

//TODO: Move dtos in api to @statsify/api-client
interface UpdateUser {
  serverMember?: boolean;
  theme?: UserTheme;
}

export class ApiService {
  private axios: AxiosInstance;

  public constructor(private apiRoute: string, private apiKey: string) {
    this.axios = Axios.create({
      baseURL: this.apiRoute,
      headers: {
        "x-api-key": this.apiKey,
      },
      timeout: 10_000,
    });
  }

  public getPlayer(tag: string) {
    return this.requestKey<GetPlayerResponse, "player">(`/player`, "player", {
      player: tag,
    });
  }

  public getCachedPlayer(tag: string) {
    return this.requestKey<GetPlayerResponse, "player">(`/player`, "player", {
      player: tag,
      cache: HypixelCache.CACHE_ONLY,
    });
  }

  public deletePlayer(tag: string) {
    return this.request<DeletePlayerResponse>(`/player`, { player: tag }, "DELETE")
      .then(() => true)
      .catch(() => false);
  }

  public getRecentGames(tag: string) {
    return this.requestKey<GetRecentGamesResponse, "recentGames">(
      `/player/recentgames`,
      "recentGames",
      {
        player: tag,
      }
    );
  }

  public getStatus(tag: string) {
    return this.requestKey<GetStatusResponse, "status">(`/player/status`, "status", {
      player: tag,
    });
  }

  public getFriends(tag: string) {
    return this.requestKey<GetFriendsResponse, "data">(`/player/friends`, "data", {
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

  public getPlayerRankings(fields: string[], uuid: string) {
    return this.request<PostLeaderboardRankingsResponse[]>(
      "/player/leaderboards/rankings",
      {},
      "POST",
      {
        body: { fields, uuid },
      }
    );
  }

  public getGuild(tag: string, type: GuildQuery) {
    return this.requestKey<GetGuildResponse, "guild">(`/guild`, "guild", {
      guild: tag,
      type,
    });
  }

  public getGuildLeaderboard(
    field: string,
    input: string | number,
    type: LeaderboardQuery
  ) {
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
      `/hypixelresources/watchdog`,
      "watchdog"
    );
  }

  public async getGamecounts() {
    return this.requestKey<GetGamecountsResponse, "gamecounts">(
      `/hypixelresources/gamecounts`,
      "gamecounts"
    );
  }

  public async getPlayerHead(uuid: string, size?: number) {
    return this.requestImage(`/skin/head`, { uuid, size });
  }

  public getPlayerSkin(uuid: string) {
    return this.requestImage(`/skin`, { uuid });
  }

  public getPlayerHistorical(tag: string, type: HistoricalType) {
    return this.requestKey<GetHistoricalResponse, "player">(`/historical`, "player", {
      player: tag,
      type,
    });
  }

  public resetPlayerHistorical(tag: string, resetMinute?: number) {
    return this.request<GetPlayerResponse>(
      `/historical`,
      { player: tag, resetMinute },
      "DELETE"
    );
  }

  public getKey() {
    return this.requestKey<GetKeyResponse, "key">(`/auth/key`, "key");
  }

  public getUser(tag: string) {
    return this.request<GetUserResponse>(`/user`, { tag })
      .then((data) => data.user ?? null)
      .catch(() => null);
  }

  public updateUser(tag: string, update: UpdateUser) {
    return this.request<GetUserResponse>(`/user`, { tag }, "PATCH", { body: update })
      .then((data) => data.user ?? null)
      .catch(() => null);
  }

  public getUserBadge(tag: string) {
    return this.requestImage(`/user/badge`, { tag }).catch(() => undefined);
  }

  public updateUserBadge(tag: string, badge: Buffer) {
    return this.request<PutUserBadgeResponse>(`user/badge`, { tag }, "PUT", {
      body: badge,
      headers: { "Content-Type": "image/png" },
    });
  }

  public deleteUserBadge(tag: string) {
    return this.request<PutUserBadgeResponse>(`user/badge`, { tag }, "DELETE");
  }

  public verifyUser(codeOrUuid: string, id: string) {
    return this.request<GetUserResponse>(
      `/user`,
      { [codeOrUuid.length >= 32 ? "uuid" : "code"]: codeOrUuid, id },
      "PUT"
    )
      .then((data) => data.user ?? null)
      .catch(() => null);
  }

  public unverifyUser(tag: string) {
    return this.request<GetUserResponse>(`/user`, { tag }, "DELETE")
      .then((data) => data.user ?? null)
      .catch(() => null);
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
    const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();

    const child = transaction?.startChild({
      op: "http.client",
      description: `GET ${url}`,
    });

    const uri = this.axios.getUri({ url, params: { key: this.apiKey, ...params } });
    const image = await loadImage(uri);

    child?.finish();

    return image;
  }
}
