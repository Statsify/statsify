/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { prettify } from "@statsify/util";

interface StatsifyGameMode<T extends string> {
  hypixel?: string;
  api: T;
  formatted?: string;
}

interface HypixelGameMode {
  hypixel: string;
  formatted: string;
}

export interface GameMode<T extends string>
  extends Omit<StatsifyGameMode<T>, "formatted"> {
  formatted: string;
}

export class GameModes<K extends string> {
  private modes: GameMode<K>[] = [];
  private hypixelModes: Record<string, string>;

  public constructor(modes: (StatsifyGameMode<K> | HypixelGameMode)[]) {
    this.modes = (modes.filter(m => "api" in m) as StatsifyGameMode<K>[]).map(m => ({
      hypixel: m.hypixel,
      api: m.api,
      formatted: m.formatted ?? prettify(m.api),
    }));

    this.hypixelModes = Object.fromEntries(
      modes
        .filter(m => "hypixel" in m)
        .map(m => [m.hypixel, m.formatted ?? prettify((m as GameMode<any>).api)])
    );
  }

  public getFormattedModes(): string[] {
    return this.modes.map(({ formatted }) => formatted);
  }

  public getApiModes(): K[] {
    return this.modes.map(({ api }) => api);
  }

  public getModes() {
    return this.modes;
  }

  public getHypixelModes() {
    return this.hypixelModes;
  }
}

export type IGameModes<T> = T extends GameModes<infer U> ? U : never;
