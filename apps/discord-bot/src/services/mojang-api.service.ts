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

  public async getPlayer(uuid: string) {
    return this.getData<AshconResponse>(uuid).catch((e) => {
      if (!e.response || !e.response.data) throw this.unknownError();
      const error = e.response.data as AshconErrorResponse;

      if (error.code === 404) throw this.missingPlayer('uuid', uuid);

      throw this.unknownError();
    });
  }

  public async checkName(name: string) {
    try {
      const { data } = await this.ashcon.get<AshconResponse>(name);
      return { name: data.username, uuid: data.uuid };
    } catch (e: any) {
      if (!e.response || !e.response.data) throw this.unknownError();

      return;
    }
  }

  public faceIconUrl(uuid: string) {
    return `https://crafatar.com/avatars/${uuid.replace(
      /-/g,
      ''
    )}?size=160&default=MHF_Steve&overlay&id=c958a4c0ca23485299ffc2cab67aea3e`;
  }

  private async getData<T>(input: string): Promise<T> {
    const { data } = await this.ashcon.get<T>(input);

    if (!data) {
      throw this.unknownError();
    }

    return data;
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
