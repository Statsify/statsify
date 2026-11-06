/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export const DEFAULT_LOCALE = "en-US";

/**
 * Locales the site serves. English is unprefixed; any other locale lives under `/{locale}/`.
 * The other 28 bot locales wait for a pixel web font with the letters the Minecraft font lacks (Latin Extended
 * and every non-Latin script).
 */
export const SUPPORTED_LOCALES = [DEFAULT_LOCALE] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export function isSupportedLocale(value: string | undefined): value is Locale {
  return value !== undefined && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/** A path's start in a locale: none for English, `/{locale}` for the rest. */
export const localePrefix = (locale: string) => (locale === DEFAULT_LOCALE ? "" : `/${locale}`);

/** The locale of a path, for the HTML `lang` attribute; unknown prefixes fall back to English. */
export function localeFromPath(pathname: string): Locale {
  const [, first] = pathname.split("/");
  return isSupportedLocale(first) ? first : DEFAULT_LOCALE;
}
