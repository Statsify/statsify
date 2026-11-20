/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import i18next, { type TFunction, type TOptions } from "i18next";

interface ILocalizeFunction {
  (key: string | string[]): string;
  (
    key: string | string[],
    options?: TOptions & { returnDetails?: true; returnObjects?: true } | string
  ): string;
  (key: string | string[], defaultValue?: string, options?: TOptions | string): string;
  (key: number): string;
}

export type LocalizeFunction = ILocalizeFunction & { locale: string };

export const getLocalizeFunction = (locale: string): LocalizeFunction => {
  const fixedT = i18next.getFixedT(locale);

  const t = (...args: Parameters<LocalizeFunction>) => {
    if (typeof args[0] === "number") return fixedT("number", { value: args[0] });
    return fixedT(...(args as unknown as Parameters<TFunction>));
  };

  Object.defineProperty(t, "locale", { value: locale });

  return t as LocalizeFunction;
};

export type LocalizationString =
  | string |
  number |
  ((t: LocalizeFunction) => string);

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
  const { options } = i18next;

  if (!Array.isArray(options.preload)) return {};

  return Object.fromEntries(
    options.preload.map((lang) => [lang, translateField(getLocalizeFunction(lang), key)])
  );
};
