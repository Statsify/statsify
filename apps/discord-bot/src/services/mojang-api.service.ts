import { User } from '@statsify/schemas';
import axios, { AxiosInstance } from 'axios';
import { randomUUID } from 'crypto';
import { Service } from 'typedi';
import { ApiService } from './api.service';

interface AshconResponse {
  uuid: string;
  username: string;
  username_history: { username: string; changed_at?: string }[];
  textures: {
    custom: boolean;
    slim: boolean;
    skin: { url: string; data: string };
    cape?: { url: string; data: string };
    raw: { url: string; data: string };
  };
}

interface AshconErrorResponse {
  code: number;
  error: string;
  reason: string;
}

@Service()
export class MojangApiService {
  private ashcon: AxiosInstance;

  public constructor(private readonly apiService: ApiService) {
    this.ashcon = axios.create({
      baseURL: 'https://api.ashcon.app/mojang/v2/user/',
      timeout: 10000,
    });
  }

  public async getPlayer(tag: string, user: User | null = null) {
    const [formattedTag, type] = this.apiService.parseTag(tag);
    const input = await this.apiService.resolveTag(formattedTag, type, user);

    return this.getData<AshconResponse>(input).catch((e) => {
      if (!e.response || !e.response.data) throw this.apiService.unknownError();
      const error = e.response.data as AshconErrorResponse;

      if (error.code === 404) throw this.apiService.missingPlayer(type, input);

      throw this.apiService.unknownError();
    });
  }

  public async checkName(name: string) {
    try {
      const data = await this.getData<AshconResponse>(name);
      return { name: data.username, uuid: data.uuid };
    } catch (e: any) {
      if (!e.response || !e.response.data) throw this.apiService.unknownError();

      return;
    }
  }

  public async getWithUser<T extends (...args: any[]) => Promise<K>, K extends { uuid: string }>(
    user: User | null,
    fn: T,
    ...args: Parameters<T>
  ): Promise<Awaited<ReturnType<T>> & { user: User | null }> {
    return this.apiService.getWithUser(user, fn.bind(this) as T, ...args);
  }

  public faceIconUrl(uuid: string) {
    return `https://crafatar.com/avatars/${uuid.replace(
      /-/g,
      ''
    )}?size=160&default=MHF_Steve&overlay&id=${randomUUID()}`;
  }

  private async getData<T>(input: string): Promise<T> {
    const { data } = await this.ashcon.get<T>(input);

    if (!data) {
      throw this.apiService.unknownError();
    }

    return data;
  }
}
