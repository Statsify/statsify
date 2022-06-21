/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import axios, { AxiosInstance } from 'axios';
import { Service } from 'typedi';

interface PitPandaPlayerDoc {
  formattedLevel: string;
  colouredName: string;
  assists: number;
  highestStreak: number;
  playtime: number;
  renown?: number;
  bounty?: number;
}

export interface PitPandaPlayer {
  rankings: Record<string, number | null>;
  uuid: string;
  name: string;
  levelString: string;
  rank: string;
  prefix: string;
  gold: number;
  kills: number;
  deaths: number;
  kdr: number;
  playtime: number;
  doc: PitPandaPlayerDoc;
}

@Service()
export class PitPandaService {
  private axios: AxiosInstance;

  public constructor() {
    this.axios = axios.create({
      baseURL: 'https://pitpanda.rocks/api',
      timeout: 10000,
      headers: {},
    });
  }

  public getPlayer(tag: string): Promise<PitPandaPlayer> {
    return this.axios
      .get(`/bot/profile/${tag}`)
      .then((res) => res.data.data)
      .catch(() => null);
  }
}
