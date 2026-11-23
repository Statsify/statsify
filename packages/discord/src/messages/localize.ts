/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import i18next, { TFunctionResult } from "i18next";
// The `localize` entry has no side effects: the package index registers font renderers when it's imported,
// which would race the support bot's own (it imports this through `#lib` before its services).
import { createLocalizeFunction } from "@statsify/profiles/localize";
import type { LocalizeFunction } from "@statsify/profiles";

export type { LocalizeFunction };

export const getLocalizeFunction = (locale: string): LocalizeFunction =>
  createLocalizeFunction(i18next.getFixedT(locale), locale);

export type LocalizationString =
  | string |
  number |
  ((t: LocalizeFunction) => TFunctionResult);

const shouldTranslate = (str: LocalizationString): boolean => {
  const type = typeof str;
  return type === "function" || type === "number";
};

export const translateField = <T extends string>(
  locale: LocalizeFunction,
  str?: LocalizationString
): T => {
  if (str === undefined) return str as unknown as T;
  if (typeof str === "string") return str as T;
  if (typeof str === "number") return locale("number", { value: str }) as T;

  return str(locale) as T;
};

export const translateObject = <T extends Record<string, LocalizationString | any>>(
  locale: LocalizeFunction,
  obj?: T
): { [key in keyof T]: T[key] extends LocalizationString ? string : T[key] } => {
  if (obj === undefined) return obj as unknown as { [key in keyof T]: T[key] };

  for (const key in obj) {
    obj[key] = shouldTranslate(obj[key]) ? translateField(locale, obj[key]) : obj[key];
  }

  return obj;
};

export const translateToAllLanguages = (
  key: LocalizationString
): Record<string, string> => {
  const { options } = i18next as unknown as i18next.i18n;

  if (!Array.isArray(options.preload)) return {};

  return Object.fromEntries(
    options.preload.map((lang) => [lang, translateField(getLocalizeFunction(lang), key)])
  );
};
