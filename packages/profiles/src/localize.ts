/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { formatNumber } from "@statsify/util";
import type { StringMap, TFunction, TFunctionKeys, TOptions } from "i18next";

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

/** Wraps an i18next `t` so that `t(1234)` formats through the `number` key, as the profiles expect. */
export function createLocalizeFunction(fixedT: TFunction, locale: string): LocalizeFunction {
  const t = (...args: Parameters<LocalizeFunction>) => {
    if (typeof args[0] === "number") return fixedT("number", { value: args[0] });
    return fixedT(...(args as unknown as Parameters<TFunction>));
  };

  Object.defineProperty(t, "locale", { value: locale });

  return t as LocalizeFunction;
}

/** i18next's interpolation format: `{{value, number}}` in the bot's number format. */
export const formatInterpolation = (value: unknown, format?: string, lng?: string) =>
  format === "number" ? formatNumber(value as number, lng) : String(value);
