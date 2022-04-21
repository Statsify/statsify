import Axios, { AxiosInstance, Method } from 'axios';
import { HypixelCache } from './hypixel-cache.enum';
import type {
  GetAchievementsResponse,
  GetFriendsResponse,
  GetPlayerResponse,
  GetRankedSkyWarsResponse,
  GetRecentGamesResponse,
  GetStatusResponse,
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

  public async getPlayer(tag: string, cacheLevel: HypixelCache) {
    const res = await this.request<GetPlayerResponse>(`/player`, {
      player: tag,
      cache: cacheLevel,
    });

    if (!res.player) {
      throw new Error(`Player not found: ${tag}`);
    }

    return res.player;
  }

  public async getRecentGames(tag: string) {
    const res = await this.request<GetRecentGamesResponse>(`/player/recentgames`, { uuid: tag });

    if (!res.games) {
      throw new Error(`Recent games not found: ${tag}`);
    }

    return res.games;
  }

  public async getStatus(tag: string) {
    const res = await this.request<GetStatusResponse>(`/player/status`, { uuid: tag });

    if (!res.status) {
      throw new Error(`Status not found: ${tag}`);
    }

    return res.status;
  }

  public async getFriends(tag: string, page = 0) {
    const res = await this.request<GetFriendsResponse>(`/player/friends`, { player: tag, page });

    if (!res.friends) {
      throw new Error(`Friends not found: ${tag}`);
    }

    return res.friends;
  }

  public async getRankedSkyWars(tag: string) {
    const res = await this.request<GetRankedSkyWarsResponse>(`/player/rankedskywars`, {
      uuid: tag,
    });

    if (!res.rankedSkyWars) {
      throw new Error(`Ranked Sky Wars not found: ${tag}`);
    }

    return res.rankedSkyWars;
  }

  public async getAchievements(tag: string) {
    const res = await this.request<GetAchievementsResponse>(`/player/achievements`, {
      player: tag,
    });

    return res;
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
