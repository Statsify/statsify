import Axios, { AxiosInstance, Method } from 'axios';
import {
  GetAchievementsResponse,
  GetFriendsResponse,
  GetPlayerResponse,
  GetRankedSkyWarsResponse,
  GetRecentGamesResponse,
  GetStatusResponse,
  GetUserResponse,
} from './responses';

export class ApiService {
  private axios: AxiosInstance;

  public constructor(apiRoute: string, apiKey: string) {
    this.axios = Axios.create({
      baseURL: apiRoute,
      headers: {
        'x-api-key': apiKey,
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
    return this.requestKey<GetRecentGamesResponse, 'games'>(`/player/recentgames`, 'games', {
      uuid: tag,
    });
  }

  public getStatus(tag: string) {
    return this.requestKey<GetStatusResponse, 'status'>(`/player/status`, 'status', {
      uuid: tag,
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
      { uuid: tag }
    );
  }

  public getAchievements(tag: string) {
    return this.request<GetAchievementsResponse>(`/player/achievements`, {
      player: tag,
    });
  }

  public getUser(tag: string) {
    return this.request<GetUserResponse>(`/user`, { tag })
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
      throw new Error(`Key not found: ${key}`);
    }

    return data[key];
  }

  private async request<T>(
    url: string,
    params?: Record<string, unknown>,
    method: Method = 'GET'
  ): Promise<T> {
    try {
      const res = await this.axios.request({
        url,
        method,
        params,
      });

      return res.data;
    } catch (err) {
      throw new Error(`Failed to request: ${(err as any).message}`);
    }
  }
}
