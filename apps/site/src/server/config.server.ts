/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { readFile } from "node:fs/promises";
import { repoRoot } from "./repo-root.server";

export interface SiteConfig {
  /** `apiClient.route` */
  apiRoute: string;
  /** `site.apiKey`: the site's own Statsify API key, never the bot's. */
  apiKey: string;
  /** `sentry.siteDsn` */
  sentryDsn?: string;
  /** `sentry.tracesSampleRate`, 0.1 when unset */
  tracesSampleRate: number;
  /** `environment`; only an explicit `"dev"` relaxes anything, so a missing value counts as production. */
  environment: string;
}

interface RawConfig {
  apiClient?: { route?: string };
  site?: { apiKey?: string };
  sentry?: { siteDsn?: string; tracesSampleRate?: number };
  environment?: string;
}

const TEST_CONFIG: SiteConfig = {
  apiRoute: "http://localhost:3000",
  apiKey: "",
  tracesSampleRate: 1,
  environment: "dev",
};

let loaded: Promise<SiteConfig> | undefined;

/**
 * The few `config.js` keys the site needs. The file is read from the repo root, the same
 * `config.json` then `config.js` precedence as `@statsify/util`, and never logged.
 */
export function siteConfig(): Promise<SiteConfig> {
  loaded ??= load();
  return loaded;
}

async function load(): Promise<SiteConfig> {
  if (process.env.VITEST) return TEST_CONFIG;

  const raw = await readRawConfig();

  return {
    apiRoute: raw.apiClient?.route || "http://localhost:3000",
    apiKey: raw.site?.apiKey ?? "",
    sentryDsn: raw.sentry?.siteDsn || undefined,
    tracesSampleRate: raw.sentry?.tracesSampleRate ?? 0.1,
    environment: raw.environment ?? "prod",
  };
}

async function readRawConfig(): Promise<RawConfig> {
  const root = repoRoot();

  const json = join(root, "config.json");
  if (existsSync(json)) return JSON.parse(await readFile(json, "utf8")) as RawConfig;

  const js = join(root, "config.js");
  if (existsSync(js)) {
    const module = (await import(/* @vite-ignore */ pathToFileURL(js).href)) as { default: RawConfig };
    return module.default;
  }

  throw new Error("No config file detected! Copy config.schema.js to config.js in the repository root.");
}
