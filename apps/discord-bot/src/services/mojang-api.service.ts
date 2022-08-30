/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiService } from "@statsify/discord";
import { AxiosInstance, default as axios } from "axios";
import { Service } from "typedi";
import { User } from "@statsify/schemas";
import { randomUUID } from "node:crypto";

export interface AshconResponse {
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
      baseURL: "https://api.ashcon.app/mojang/v2/user/",
      timeout: 10_000,
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

  public faceIconUrl(uuid: string) {
    return `https://crafatar.com/avatars/${uuid.replaceAll(
      "-",
      ""
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
