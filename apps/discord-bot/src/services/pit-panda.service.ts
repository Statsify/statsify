/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import axios, { AxiosInstance } from "axios";
import { ApiService, ErrorMessage } from "@statsify/discord";
import { Service } from "typedi";
import { User } from "@statsify/schemas";

interface PitPandaPlayerDoc {
  formattedLevel: string;
  colouredName: string;
  assists: number;
  highestStreak: number;
  playtime: number;
  renown?: number;
  bounty?: number;
}

interface PitPandaPlayerProgress {
  displayCurrent: number;
  displayGoal: number;
}

export interface PitPandaPlayer {
  rankings: Record<string, number | null>;
  uuid: string;
  name: string;
  levelString: string;
  rank: string;
  xp: string;
  prefix: string;
  gold: number;
  kills: number;
  deaths: number;
  kdr: number;
  playtime: number;
  doc: PitPandaPlayerDoc;

  xpProgress: PitPandaPlayerProgress;
}

@Service()
export class PitPandaService {
  private axios: AxiosInstance;

  public constructor(private readonly apiService: ApiService) {
    this.axios = axios.create({
      baseURL: "https://pitpanda.rocks/api",
      timeout: 10_000,
    });
  }

  public async getPlayer(tag: string, user: User | null = null): Promise<PitPandaPlayer> {
    const [formattedTag, type] = this.apiService.parseTag(tag);
    const input = await this.apiService.resolveTag(formattedTag, type, user);

    return this.axios
      .get(`/bot/profile/${input}`)
      .then((res) => res.data.data)
      .catch((e) => {
        if (e.response.data.error === "Player has not played the Pit")
          throw new ErrorMessage(
            (t) => t("errors.noPitStats.title"),
            (t) => t("errors.noPitStats.description", { displayName: input })
          );
        if (e.response.status === 400) throw this.apiService.missingPlayer(type, input);

        throw this.apiService.unknownError();
      });
  }
}
