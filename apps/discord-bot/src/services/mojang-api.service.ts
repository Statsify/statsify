/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import axios, { AxiosInstance } from "axios";
import { ApiService } from "@statsify/discord";
import { Service } from "typedi";
import { User } from "@statsify/schemas";
import { randomUUID } from "node:crypto";

export interface MojangResponse {
  uuid: string;
  username: string;
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
    return this.apiService.getPlayerSkinTextures(tag, user);
  }

  public async checkName(name: string): Promise<{ name: string, uuid: string } | undefined> {
    try {
      const data = await this.getData<MojangResponse>(name);
      return { name: data.username, uuid: data.uuid };
    } catch (e: any) {
      if (!e.response || !e.response.data) throw this.apiService.unknownError();

      return;
    }
  }

  public faceIconUrl(uuid: string) {
    const dashlessUuid = uuid.replaceAll("-", "");
    return `https://crafatar.com/avatars/${dashlessUuid}?size=160&default=MHF_Steve&overlay&id=${randomUUID()}`;
  }

  private async getData<T>(input: string): Promise<T> {
    const { data } = await this.ashcon.get<T>(input);

    if (!data) {
      throw this.apiService.unknownError();
    }

    return data;
  }
}
