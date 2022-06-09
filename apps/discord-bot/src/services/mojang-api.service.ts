import axios, { AxiosInstance } from 'axios';
import { Service } from 'typedi';
import { ErrorMessage } from '../error.message';

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

  public constructor() {
    this.ashcon = axios.create({
      baseURL: 'https://api.ashcon.app/mojang/v2/user/',
      timeout: 10000,
    });
  }

  public async getName(uuid: string) {
    try {
      const { data } = await this.ashcon.get<AshconResponse>(uuid);
      return data.username;
    } catch (e: any) {
      if (!e.response || !e.response.data) throw this.unknownError();
      const error = e.response.data as AshconErrorResponse;

      if (error.code === 404) throw this.missingPlayer('uuid', uuid);
    }
  }

  public async getNameHistory(tag: string) {
    try {
      const { data } = await this.ashcon.get<AshconResponse>(tag);
      return data.username_history;
    } catch (e: any) {
      if (!e.response || !e.response.data) throw this.unknownError();
      const error = e.response.data as AshconErrorResponse;

      if (error.code === 404) throw this.missingPlayer('name', tag);
    }
  }

  private unknownError() {
    return new ErrorMessage(
      (t) => t('errors.unknown.title'),
      (t) => t('errors.unknown.description')
    );
  }

  private missingPlayer(type: string, tag: string) {
    return new ErrorMessage(
      (t) => t('errors.invalidPlayer.title'),
      (t) => t('errors.invalidPlayer.description', { type, tag })
    );
  }
}
