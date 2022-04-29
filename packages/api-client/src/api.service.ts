import Axios, { AxiosInstance, Method } from 'axios';
import { HypixelCache } from './hypixel-cache.enum';
import {
  DeletePlayerResponse,
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

    if (!res.player) {
      throw new Error(`Player "${tag}" had no data.`);
    }

    return res.player;
  }

  public async deletePlayer(tag: string) {
    const res = await this.request<DeletePlayerResponse>(`/player`, {
      player: tag,
    });

    if (!res.success) {
      throw new Error(`Deleting player ${tag} failed.`);
    }

    return res.success;
  }

  public async getRecentGames(tag: string) {
    const res = await this.request<GetRecentGamesResponse>(`/player/recentgames`, { uuid: tag });

    if (!res.games) {
      throw new Error(`The player "${tag}" has no recent games available.`);
    }

    return res.games;
  }

  public async getStatus(tag: string) {
    const res = await this.request<GetStatusResponse>(`/player/status`, { uuid: tag });

    if (!res.status) {
      throw new Error(`The player "${tag}" had no status data.`);
    }

    return res.status;
  }

  public async getFriends(tag: string, page = 0) {
    const res = await this.request<GetFriendsResponse>(`/player/friends`, { player: tag, page });

    if (!res.friends) {
      throw new Error(`The player "${tag}" has no friend data.`);
    }

    return res.friends;
  }

  public async getRankedSkyWars(tag: string) {
    const res = await this.request<GetRankedSkyWarsResponse>(`/player/rankedskywars`, {
      uuid: tag,
    });

    if (!res.rankedSkyWars) {
      throw new Error(`The player "${tag}" has no ranked skywars data.`);
    }

    return res.rankedSkyWars;
  }

  public async getAchievements(tag: string) {
    const res = await this.request<GetAchievementsResponse>(`/player/achievements`, {
      player: tag,
    });

    if (!res.achievements) {
      throw new Error(`The player "${tag}" has no achievement data.`);
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

    if (!res.data) {
      throw new Error(`The leaderboard "${field}" returned no data on page ${page}.`);
    }

    return res;
  }

  public async getRankings(fields: string[], uuid: string) {
    const res = await this.request<PostPlayerRankingsResponse>(
      `/player/leaderboards/rankings`,
      { fields, uuid },
      'POST'
    );

    if (!res.rank) {
      throw new Error(`The player "${uuid}" has no ranking data.`);
    }

    return res;
  }

  public async getGuild(guild: string, type: 'ID' | 'NAME' | 'PLAYER', cacheLevel: HypixelCache) {
    const res = await this.request<GetGuildResponse>(`/guild`, {
      guild,
      type,
      cache: cacheLevel,
    });

    if (!res.guild) {
      throw new Error(`The Guild ${type} "${guild}" has no data.`);
    }

    return res.guild;
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

    if (!res.data) {
      throw new Error(`The guild leaderboard "${field}" returned no data on page ${page}.`);
    }

    return res;
  }

  public async getGuildRankings(field: string, name: string) {
    const res = await this.request<PostPlayerRankingsResponse>(
      `/guild/leaderboards/rankings`,
      { field, name },
      'POST'
    );

    if (!res.rank) {
      throw new Error(`The guild "${name}" has no ranking data.`);
    }

    return res;
  }

  public async getWatchdogStats() {
    const res = await this.request<GetWatchdogResponse>(`/hypixelresources/watchdog`);

    if (!res.watchdog) {
      throw new Error('No Watchdog data is available.');
    }

    return res.watchdog;
  }

  public async getGameCounts() {
    const res = await this.request<GetGamecountsResponse>(`/hypixelresources/gamecounts`);

    if (!res.gamecounts) {
      throw new Error('No Game Count data is available.');
    }

    return res.gamecounts;
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

    return res.key;
  }

  public async getDiscordUser(tag: string) {
    const res = await this.request<GetUserResponse>(`/user`, { tag });

    if (!res.user) {
      throw new Error(`The user "${tag}" has no data available.`);
    }

    return res.user;
  }

  public async verifyUser(code: string, id: string) {
    const res = await this.request<GetUserResponse>(`/user`, { code, id }, 'PUT');

    if (!res.user) {
      throw new Error(`Verification with code "${code}" for "${id}" has no data available.`);
    }

    return res.user;
  }

  public async unverifyUser(tag: string) {
    const res = await this.request<GetUserResponse>(`/user`, { tag }, 'DELETE');

    return res.user;
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
