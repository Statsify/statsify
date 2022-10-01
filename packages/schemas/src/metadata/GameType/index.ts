/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ChallengesBedWars } from "../../player";
import { Constructor } from "@statsify/util";
import { HypixelGameMode, StatsifyGameMode } from "../../game";
import { Progression } from "../../progression";

const GAMETYPE_METADATA_KEY = "statsify:gametype";

export interface HypixelGameMetadata {
  gameModes?: StatsifyGameMode<string>[];
}

type ignoredTypes = string | boolean | number | Progression | ChallengesBedWars;
type OptionalString<K = void> = K extends string ? K : never;

export type StatsifyApiModes<T, K = void> =
  | OptionalString<K>
  | keyof Pick<
      T,
      {
        [Key in keyof T]: T[Key] extends ignoredTypes ? never : Key;
      }[keyof T]
    >;

export function Mode(hypixel?: string, formatted?: string): PropertyDecorator {
  return (target, propertyKey) => {
    const { gameModes = [] } = (Reflect.getMetadata(GAMETYPE_METADATA_KEY, target) ??
      {}) as HypixelGameMetadata;

    hypixel = hypixel === "" ? undefined : hypixel;
    formatted = formatted === "" ? undefined : formatted;

    Reflect.defineMetadata(
      GAMETYPE_METADATA_KEY,
      {
        gameModes: [...gameModes, { hypixel, api: propertyKey, formatted }],
      },
      target
    );
  };
}

export function GameType(
  baseName?: string,
  hypixel?: string,
  formatted?: string
): ClassDecorator {
  return (target: any) => {
    if (!baseName) return;
    const { gameModes = [] } = (Reflect.getMetadata(GAMETYPE_METADATA_KEY, target) ??
      {}) as HypixelGameMetadata;

    Reflect.defineMetadata(
      GAMETYPE_METADATA_KEY,
      {
        gameModes: [{ api: baseName, hypixel, formatted }, ...gameModes],
      },
      target
    );
  };
}

export function GetMetadataModes(target: Constructor) {
  const { gameModes = [] } = (Reflect.getMetadata(GAMETYPE_METADATA_KEY, target) ??
    {}) as HypixelGameMetadata;

  return gameModes as HypixelGameMode[];
}
