import { ApiService as StatsifyApiService, HypixelCache } from '@statsify/api-client';
import { Service } from 'typedi';
import { ErrorResponse } from '../util';

@Service()
export class ApiService extends StatsifyApiService {
  public constructor() {
    super(process.env.API_ROUTE, process.env.API_KEY);
  }

  public getPlayer(tag: string) {
    return super.getPlayer(tag, HypixelCache.LIVE).catch(() => {
      throw new ErrorResponse('Player not found', 'The player you are looking for does not exist.');
    });
  }
}
