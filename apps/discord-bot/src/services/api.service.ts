import { Player } from '@statsify/schemas';
import Axios, { AxiosInstance, Method } from 'axios';
import { Service } from 'typedi';

@Service()
export class ApiService {
  private axios: AxiosInstance;

  public constructor() {
    this.axios = Axios.create({
      baseURL: `${process.env.API_ROUTE}/api`,
      headers: {
        'x-api-key': process.env.API_KEY,
      },
      timeout: 5000,
    });
  }

  public async getPlayer(tag: string): Promise<Player> {
    const res = await this.request(`/player`, { player: tag });

    if (!res.player) {
      throw new Error(`Player not found: ${tag}`);
    }

    return res.player;
  }

  private async request(url: string, params?: Record<string, string>, method: Method = 'GET') {
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
