/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { HistoricalTimeData } from "./components/Historical/Header.js";
import type { Image } from "skia-canvas";
import type { Player, User } from "@statsify/schemas";
import type { StringMap, TFunctionKeys, TOptions } from "i18next";

interface ILocalizeFunction {
  <TKeys extends TFunctionKeys = string>(key: TKeys | TKeys[]): string;
  <TKeys extends TFunctionKeys = string, TInterpolationMap extends object = StringMap>(
    key: TKeys | TKeys[],
    options?: TOptions<TInterpolationMap> & { returnDetails?: true; returnObjects?: true } | string
  ): string;
  <TKeys extends TFunctionKeys = string, TInterpolationMap extends object = StringMap>(
    key: TKeys | TKeys[],
    defaultValue?: string,
    options?: TOptions<TInterpolationMap> | string
  ): string;
  (key: number): string;
}

/** The bot's translator: an i18next `t` that also formats bare numbers, tagged with its locale. */
export type LocalizeFunction = ILocalizeFunction & { locale: string };

export type ProfileTime = "LIVE" | HistoricalTimeData;

export interface BaseProfileProps {
  skin: Image;
  player: Player;
  background: Image;
  logo: Image;
  user: User | null;
  badge?: Image;
  t: LocalizeFunction;
  time: ProfileTime;
}
