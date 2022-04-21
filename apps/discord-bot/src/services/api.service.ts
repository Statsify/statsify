import { ApiService as StatsifyApiService } from '@statsify/api-client';
import { Service } from 'typedi';

@Service()
export class ApiService extends StatsifyApiService {
  public constructor() {
    super(process.env.API_ROUTE, process.env.API_KEY);
  }
}
