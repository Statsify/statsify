/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { DEFAULT_LOCALE } from "./locales";
import { createI18n } from "./i18n";
import { join } from "node:path";
import { readFile, readdir } from "node:fs/promises";
import { repoRoot } from "~/server/repo-root.server";
import type { Resource, ResourceKey } from "i18next";

export type Namespace = Record<string, unknown>;

/** The bot's `locales/` directory, shared with Crowdin. */
function localesDirectory() {
  return join(repoRoot(), "locales");
}

/** Each namespace is read once: the locale files change only with a deploy, which restarts the site. */
const namespaces = new Map<string, Promise<Namespace | undefined>>();

/** A locale's namespace file, parsed once and shared by every request, so callers must not change it. */
export function readNamespace(locale: string, namespace: string): Promise<Namespace | undefined> {
  const key = `${locale}/${namespace}`;
  let parsed = namespaces.get(key);

  if (!parsed) {
    parsed = parseNamespace(key);
    // A failed read is tried again on the next request.
    parsed.catch(() => namespaces.delete(key));
    namespaces.set(key, parsed);
  }

  return parsed;
}

async function parseNamespace(key: string): Promise<Namespace | undefined> {
  try {
    const file = await readFile(join(localesDirectory(), `${key}.json`), "utf8");
    return JSON.parse(file) as Namespace;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

/**
 * What the browser needs for one locale: the `site` namespace and the `stats` subtree of the
 * bot's `default` namespace, plus the English fallback for anything untranslated.
 */
export async function loadResources(locale: string): Promise<Resource> {
  const locales = locale === DEFAULT_LOCALE ? [locale] : [locale, DEFAULT_LOCALE];

  const entries = await Promise.all(
    locales.map(async (lng) => {
      const [site, defaults] = await Promise.all([readNamespace(lng, "site"), readNamespace(lng, "default")]);

      return [
        lng,
        {
          site: site ?? {},
          default: { stats: defaults?.stats ?? {} },
        },
      ] as const;
    })
  );

  return Object.fromEntries(entries);
}

/** Every string in a namespace with its dotted key, for the locale-compat test. */
function* leaves(value: unknown, path: string[] = []): Generator<[key: string, value: string]> {
  if (typeof value === "string") {
    yield [path.join("."), value];
    return;
  }

  if (Array.isArray(value)) {
    for (const [index, item] of value.entries()) yield* leaves(item, [...path, String(index)]);
    return;
  }

  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) yield* leaves(item, [...path, key]);
  }
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  const PLURAL_SUFFIX = /_(?:zero|one|two|few|many|other|plural|\d+)$/;
  const PLACEHOLDER = /\{\{([^}]*)\}\}/g;
  const SUPPORTED_PLACEHOLDER = /^\s*[\w.-]+(?:,\s*number)?\s*$/;

  describe("locale files", () => {
    it("load unchanged into the site's i18next", async () => {
      const entries = await readdir(localesDirectory(), { withFileTypes: true });
      const locales = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
      expect(locales).toContain(DEFAULT_LOCALE);

      const files = await Promise.all(
        locales.map(async (locale) => ({
          locale,
          defaults: await readNamespace(locale, "default"),
          site: await readNamespace(locale, "site"),
        }))
      );

      for (const { locale, defaults, site } of files) {
        expect(defaults, `${locale}/default.json`).toBeDefined();

        const i18n = createI18n(locale, { [locale]: { default: defaults as ResourceKey, site: site ?? {} } });

        for (const [namespace, json] of [["default", defaults], ["site", site]] as const) {
          for (const [key, raw] of leaves(json)) {
            const where = `${locale}/${namespace}.json ${key}`;

            // The bot never used plural keys; i18next would otherwise treat these as variants.
            expect(key, where).not.toMatch(PLURAL_SUFFIX);

            // Only `{{name}}` and `{{name, number}}` are interpolated by the site.
            for (const [, placeholder] of raw.matchAll(PLACEHOLDER)) expect(placeholder, where).toMatch(SUPPORTED_PLACEHOLDER);

            // Every key resolves (no missing keys, no unresolved `$t()` nesting).
            const resolved = i18n.t(key, { ns: namespace, value: 1234 });
            expect(resolved, where).not.toBe(key);
            expect(resolved, where).not.toContain("$t(");
          }
        }
      }
    });
  });
}
