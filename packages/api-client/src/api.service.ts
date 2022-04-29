import Axios, { AxiosInstance, Method } from 'axios';
import { HypixelCache } from './hypixel-cache.enum';
import {
  DeletePlayerResponse,
  ErrorResponse,
  GetAchievementsResponse,
  GetFriendsResponse,
  GetGamecountsResponse,
  GetGuildResponse,
  GetKeyResponse,
  GetPlayerResponse,
  GetRankedSkyWarsResponse,
  GetRecentGamesResponse,
  GetStatusResponse,
  GetUserResponse,
  GetWatchdogResponse,
  PostPlayerLeaderboardResponse,
  PostPlayerRankingsResponse,
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

    if ((res as unknown as ErrorResponse).error) {
      throw new Error((res as unknown as ErrorResponse).message[0]);
    }

    return res?.player;
  }

  public async deletePlayer(tag: string) {
    const res = await this.request<DeletePlayerResponse>(`/player`, {
      player: tag,
    });

    if ((res as unknown as ErrorResponse).error) {
      throw new Error((res as unknown as ErrorResponse).message[0]);
    }

    return res.success;
  }

  public async getRecentGames(tag: string) {
    const res = await this.request<GetRecentGamesResponse>(`/player/recentgames`, { uuid: tag });

    if ((res as unknown as ErrorResponse).error) {
      throw new Error((res as unknown as ErrorResponse).message[0]);
    }

    return res.games;
  }

  public async getStatus(tag: string) {
    const res = await this.request<GetStatusResponse>(`/player/status`, { uuid: tag });

    if ((res as unknown as ErrorResponse).error) {
      throw new Error((res as unknown as ErrorResponse).message[0]);
    }

    return res.status;
  }

  public async getFriends(tag: string, page = 0) {
    const res = await this.request<GetFriendsResponse>(`/player/friends`, { player: tag, page });

    if ((res as unknown as ErrorResponse).error) {
      throw new Error((res as unknown as ErrorResponse).message[0]);
    }

    return res.friends;
  }

  public async getRankedSkyWars(tag: string) {
    const res = await this.request<GetRankedSkyWarsResponse>(`/player/rankedskywars`, {
      uuid: tag,
    });

    if ((res as unknown as ErrorResponse).error) {
      throw new Error((res as unknown as ErrorResponse).message[0]);
    }

    return res.rankedSkyWars;
  }

  public async getAchievements(tag: string) {
    const res = await this.request<GetAchievementsResponse>(`/player/achievements`, {
      player: tag,
    });

    if ((res as unknown as ErrorResponse).error) {
      throw new Error((res as unknown as ErrorResponse).message[0]);
    }

    return res;
  }

  public async getLeaderboard(field: string, page = 0, uuid?: string) {
    const res = await this.request<PostPlayerLeaderboardResponse>(
      `/player/leaderboards`,
      {
        field,
        page,
        uuid,
      },
      'POST'
    );

    if ((res as unknown as ErrorResponse).error) {
      throw new Error((res as unknown as ErrorResponse).message[0]);
    }

    return res;
  }

  public async getRankings(fields: string[], uuid: string) {
    const res = await this.request<PostPlayerRankingsResponse>(
      `/player/leaderboards/rankings`,
      { fields, uuid },
      'POST'
    );

    if ((res as unknown as ErrorResponse).error) {
      throw new Error((res as unknown as ErrorResponse).message[0]);
    }

    return res;
  }

  public async getGuild(tag: string, type: 'ID' | 'NAME' | 'PLAYER', cacheLevel: HypixelCache) {
    const res = await this.request<GetGuildResponse>(`/guild`, {
      guild: tag,
      type,
      cache: cacheLevel,
    });

    if ((res as unknown as ErrorResponse).error) {
      throw new Error((res as unknown as ErrorResponse).message[0]);
    }

    return res;
  }

  public async getGuildLeaderboard(field: string, page = 0, name?: string) {
    const res = await this.request<PostPlayerLeaderboardResponse>(
      `/guild/leaderboards`,
      {
        field,
        page,
        name,
      },
      'POST'
    );

    if ((res as unknown as ErrorResponse).error) {
      throw new Error((res as unknown as ErrorResponse).message[0]);
    }

    return res;
  }

  public async getGuildRankings(field: string, name: string) {
    const res = await this.request<PostPlayerRankingsResponse>(
      `/guild/leaderboards/rankings`,
      { field, name },
      'POST'
    );

    if ((res as unknown as ErrorResponse).error) {
      throw new Error((res as unknown as ErrorResponse).message[0]);
    }

    return res;
  }

  public async getWatchdogStats() {
    const res = await this.request<GetWatchdogResponse>(`/hypixelresources/watchdog`);

    if ((res as unknown as ErrorResponse).error) {
      throw new Error((res as unknown as ErrorResponse).message[0]);
    }

    return res;
  }

  public async getGameCounts() {
    const res = await this.request<GetGamecountsResponse>(`/hypixelresources/gamecounts`);

    if ((res as unknown as ErrorResponse).error) {
      throw new Error((res as unknown as ErrorResponse).message[0]);
    }

    return res;
  }

  public async getPlayerHead(uuid: string) {
    const res = await this.request(`/skin/head`, { uuid });

    return res;
  }

  public async getPlayerSkin(uuid: string) {
    const res = await this.request(`/skin`, { uuid });

    return res;
  }

  public async getKeyInfo() {
    const res = await this.request<GetKeyResponse>(`/auth/key`);

    if (!res.key) {
      throw new Error('No key data was available.');
    }

    return res;
  }

  public async getDiscordUser(tag: string) {
    const res = await this.request<GetUserResponse>(`/user`, { tag });

    if (!res.user) {
      throw new Error(`The user "${tag}" has no data available.`);
    }

    return res;
  }

  public async verifyUser(code: string, id: string) {
    const res = await this.request<GetUserResponse>(`/user`, { code, id }, 'PUT');

    if (!res.user) {
      throw new Error(`Verification with code "${code}" for "${id}" has no data available.`);
    }

    return res;
  }

  public async unverifyUser(tag: string) {
    const res = await this.request<GetUserResponse>(`/user`, { tag }, 'DELETE');

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
