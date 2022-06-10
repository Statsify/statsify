import Axios, { AxiosInstance, AxiosRequestHeaders, Method } from 'axios';
import { loadImage } from 'skia-canvas';
import { GuildQuery, HistoricalType } from './enums';
import {
  GetAchievementsResponse,
  GetFriendsResponse,
  GetGamecountsResponse,
  GetGuildResponse,
  GetHistoricalResponse,
  GetKeyResponse,
  GetPlayerResponse,
  GetRankedSkyWarsResponse,
  GetRecentGamesResponse,
  GetStatusResponse,
  GetUserResponse,
  GetWatchdogResponse,
  PostGuildLeaderboardResponse,
  PostGuildRankingsResponse,
  PostPlayerLeaderboardResponse,
  PostPlayerRankingsResponse,
  PutUserBadgeResponse,
} from './responses';

interface ExtraData {
  headers?: AxiosRequestHeaders;
  body?: Record<string, unknown> | Buffer | string;
}

export class ApiService {
  private axios: AxiosInstance;

  public constructor(private apiRoute: string, private apiKey: string) {
    this.axios = Axios.create({
      baseURL: this.apiRoute,
      headers: {
        'x-api-key': this.apiKey,
      },
      timeout: 5000,
    });
  }

  public getPlayer(tag: string) {
    return this.requestKey<GetPlayerResponse, 'player'>(`/player`, 'player', {
      player: tag,
    });
  }

  public getRecentGames(tag: string) {
    return this.requestKey<GetRecentGamesResponse, 'recentGames'>(
      `/player/recentgames`,
      'recentGames',
      {
        player: tag,
      }
    );
  }

  public getStatus(tag: string) {
    return this.requestKey<GetStatusResponse, 'status'>(`/player/status`, 'status', {
      player: tag,
    });
  }

  public getFriends(tag: string, page = 0) {
    return this.requestKey<GetFriendsResponse, 'friends'>(`/player/friends`, 'friends', {
      player: tag,
      page,
    });
  }

  public getRankedSkyWars(tag: string) {
    return this.requestKey<GetRankedSkyWarsResponse, 'rankedSkyWars'>(
      `/player/rankedskywars`,
      'rankedSkyWars',
      { player: tag }
    );
  }

  public getAchievements(tag: string) {
    return this.request<GetAchievementsResponse>(`/player/achievements`, {
      player: tag,
    });
  }

  public getPlayerLeaderboard(field: string, page: number): Promise<PostPlayerLeaderboardResponse>;
  public getPlayerLeaderboard(field: string, uuid: string): Promise<PostPlayerLeaderboardResponse>;
  public getPlayerLeaderboard(
    field: string,
    pageOrUuid: number | string
  ): Promise<PostPlayerLeaderboardResponse> {
    return this.request<PostPlayerLeaderboardResponse>('/player/leaderboards', {}, 'POST', {
      body: {
        field,
        [typeof pageOrUuid === 'number' ? 'page' : 'uuid']: pageOrUuid,
      },
    });
  }

  public getPlayerRankings(fields: string[], uuid: string) {
    return this.request<PostPlayerRankingsResponse>('/player/leaderboards/rankings', {}, 'POST', {
      body: { fields, uuid },
    });
  }

  public getGuild(tag: string, type: GuildQuery) {
    return this.requestKey<GetGuildResponse, 'guild'>(`/guild`, 'guild', {
      guild: tag,
      type,
    });
  }

  public getGuildLeaderboard(field: string, page: number): Promise<PostGuildLeaderboardResponse>;
  public getGuildLeaderboard(field: string, name: string): Promise<PostGuildLeaderboardResponse>;
  public getGuildLeaderboard(
    field: string,
    pageOrName: number | string
  ): Promise<PostGuildLeaderboardResponse> {
    return this.request<PostGuildLeaderboardResponse>('/guild/leaderboards', {}, 'POST', {
      body: {
        field,
        [typeof pageOrName === 'number' ? 'page' : 'name']: pageOrName,
      },
    });
  }

  public getGuildRanking(fields: string, name: string) {
    return this.request<PostGuildRankingsResponse>('/guild/leaderboards/rankings', {}, 'POST', {
      body: { fields, name },
    });
  }

  public async getWatchdog() {
    return this.requestKey<GetWatchdogResponse, 'watchdog'>(
      `/hypixelresources/watchdog`,
      'watchdog'
    );
  }

  public async getGameCounts() {
    return this.requestKey<GetGamecountsResponse, 'gamecounts'>(
      `/hypixelresources/gamecounts`,
      'gamecounts'
    );
  }

  public async getPlayerHead(uuid: string) {
    return this.requestImage(`/skin/head`, { uuid });
  }

  public getPlayerSkin(uuid: string) {
    return this.requestImage(`/skin`, { uuid });
  }

  public getPlayerHistorical(tag: string, type: HistoricalType) {
    return this.requestKey<GetHistoricalResponse, 'player'>(`/historical`, 'player', {
      player: tag,
      type,
    });
  }

  public resetPlayerHistorical(tag: string) {
    return this.request<GetPlayerResponse>(`/historical`, { player: tag }, 'DELETE');
  }

  public getKey() {
    return this.requestKey<GetKeyResponse, 'key'>(`/auth/key`, 'key');
  }

  public getUser(tag: string) {
    return this.request<GetUserResponse>(`/user`, { tag })
      .then((data) => data.user ?? null)
      .catch(() => null);
  }

  public getUserBadge(tag: string) {
    return this.requestImage(`/user/badge`, { tag }).catch(() => undefined);
  }

  public updateUserBadge(tag: string, badge: Buffer) {
    this.request<PutUserBadgeResponse>(`user/badge`, { tag }, 'PUT', {
      body: badge,
      headers: { 'Content-Type': 'image/png' },
    });
  }

  public verifyUser(code: string, id: string) {
    return this.request<GetUserResponse>(`/user`, { code, id }, 'PUT')
      .then((data) => data.user ?? null)
      .catch(() => null);
  }

  public unverifyUser(tag: string) {
    return this.request<GetUserResponse>(`/user`, { tag }, 'DELETE')
      .then((data) => data.user ?? null)
      .catch(() => null);
  }

  private async requestKey<T, K extends keyof T>(
    url: string,
    key: K,
    params?: Record<string, unknown>,
    method: Method = 'GET'
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
    method: Method = 'GET',
    { body, headers }: ExtraData = {}
  ): Promise<T> {
    const res = await this.axios.request({
      url,
      method,
      params,
      headers,
      data: body,
    });

    const data = res.data;

    if (data.success === false) throw new Error('API request was unsuccessful');

    return data;
  }

  private requestImage(url: string, params?: Record<string, unknown>) {
    return loadImage(this.axios.getUri({ url, params: { key: this.apiKey, ...params } }));
  }
}
