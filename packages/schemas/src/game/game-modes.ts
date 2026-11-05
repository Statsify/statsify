/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { prettify } from "@statsify/util";

type OptionMetadata = {
  aliases?: readonly string[];
  description?: string;
  emoji?: string;
};

export type GameMode<Modes extends Mode[]> = {
  [Key in ApiModeFromGameModes<Modes>]: {
    api: Key;
    formatted: string;
    hypixel?: string;
    submode: [SubModeForMode<Modes, Key>] extends [never] ? undefined : SubModeForMode<Modes, Key>;
  } & OptionMetadata
}[ApiModeFromGameModes<Modes>];

export type GameModeWithSubModes<Modes extends Mode[]> = {
  [Key in ApiModeFromGameModes<Modes>]: {
    api: Key;
    formatted: string;
    hypixel?: string;
    submodes: SubModeForMode<Modes, Key>[];
  } & OptionMetadata
}[ApiModeFromGameModes<Modes>];

export type Mode = ({
  hypixel: string;
  formatted: string;
} | {
  hypixel?: string;
  api: string;
  formatted?: string;
  submodes?: SubMode[];
}) & OptionMetadata;

type SubMode = { api: string; formatted?: string } & OptionMetadata;

export class GameModes<Modes extends Mode[]> {
  private modes: GameModeWithSubModes<Modes>[];
  private hypixelModes: Record<string, string>;

  public constructor(modes: Modes) {
    this.modes = modes.filter((m) => "api" in m).map((m) => ({
      hypixel: m.hypixel,
      api: m.api,
      formatted: m.formatted ?? prettify(m.api),
      aliases: m.aliases,
      description: m.description,
      emoji: m.emoji,
      submodes: m.submodes?.map((sm) => ({ ...sm, formatted: sm.formatted ?? prettify(sm.api) })) ?? [],
    })) as GameModeWithSubModes<Modes>[];

    this.hypixelModes = Object.fromEntries(
      modes
        .map((m) => {
          if (typeof m.hypixel !== "string") return;
          const formatted = m.formatted ?? prettify((m as { api: string }).api);
          return [m.hypixel, formatted] as const;
        }).filter((entry) => entry !== undefined)
    );
  }

  public getFormattedModes(): string[] {
    return this.modes.map(({ formatted }) => formatted);
  }

  public getApiModes(): ApiModeFromGameModes<Modes>[] {
    return this.modes.map(({ api }) => api);
  }

  public getModes() {
    return this.modes;
  }

  public getHypixelModes() {
    return this.hypixelModes;
  }
}

export type ExtractGameModes<T> = T extends GameModes<infer U> ? U : never;
export type ModeFromGameModes<T extends Mode[]> = Extract<T[number], { api: string }>;
export type ApiModeFromGameModes<T extends Mode[]> = ModeFromGameModes<T>["api"];

type ExtractSubModes<T extends Mode[], M extends ApiModeFromGameModes<T>> = Extract<T[number], { api: M; submodes: SubMode[] }>["submodes"][number];

export type SubModeForMode<T extends Mode[], M extends ApiModeFromGameModes<T>> =
  [ExtractSubModes<T, M>] extends [never] ?
    never :
    ExtractSubModes<T, M> & OptionMetadata & { formatted: string };

export type ApiSubModeForMode<T extends Mode[], M extends ApiModeFromGameModes<T>> = NeverToUndefined<ExtractSubModes<T, M>["api"]>;

type NeverToUndefined<T> = [T] extends [never] ? undefined : T;
