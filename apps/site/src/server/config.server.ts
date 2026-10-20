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
  /** `database.redisUrl`: the API's Redis, which also holds rendered unfurl images and their render locks. */
  redisUrl: string;
  /**
   * `site.publicUrl`: the origin the site is served from, e.g. `https://statsify.net`. Absolute URLs
   * (Open Graph, oEmbed) are built from it and never from `Host` or forwarded headers. Required outside `dev`.
   */
  publicUrl: string;
  /** `site.apiKey`: the site's own Statsify API key, never the bot's. */
  apiKey: string;
  /** `sentry.siteDsn` */
  sentryDsn?: string;
  /** `site.turnstile.siteKey`: rendered on the player-not-found page; empty disables the widget. */
  turnstileSiteKey: string;
  /** `site.turnstile.secretKey`: verifies lookup tokens; empty blocks lookups outside `dev`. */
  turnstileSecretKey: string;
  /** `sentry.tracesSampleRate`, 0.1 when unset */
  tracesSampleRate: number;
  /** `environment`; only an explicit `"dev"` relaxes anything, so a missing value counts as production. */
  environment: string;
  /** `site.renderWorkers`: threads in the unfurl render pool, 1 to 3; 2 when unset. */
  renderWorkers: number;
}

interface RawConfig {
  database?: { redisUrl?: string };
  apiClient?: { route?: string };
  site?: {
    apiKey?: string;
    publicUrl?: string;
    turnstile?: { siteKey?: string; secretKey?: string };
    renderWorkers?: unknown;
  };
  sentry?: { siteDsn?: string; tracesSampleRate?: number };
  environment?: string;
}

const TEST_CONFIG: SiteConfig = {
  apiRoute: "http://localhost:3000",
  redisUrl: "redis://localhost:6379",
  publicUrl: "http://localhost:7828",
  apiKey: "",
  turnstileSiteKey: "",
  turnstileSecretKey: "",
  tracesSampleRate: 1,
  environment: "dev",
  renderWorkers: 2,
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
  // Every page reads the API with this key, so without it a production site would answer every page with an error.
  if (!raw.site?.apiKey && raw.environment !== "dev") throw new Error("[site] site.apiKey must be set outside dev");

  return {
    apiRoute: raw.apiClient?.route || "http://localhost:3000",
    redisUrl: raw.database?.redisUrl || "redis://localhost:6379",
    publicUrl: publicUrlOf(raw),
    apiKey: raw.site?.apiKey ?? "",
    turnstileSiteKey: raw.site?.turnstile?.siteKey ?? "",
    turnstileSecretKey: raw.site?.turnstile?.secretKey ?? "",
    sentryDsn: raw.sentry?.siteDsn || undefined,
    tracesSampleRate: raw.sentry?.tracesSampleRate ?? 0.1,
    environment: raw.environment ?? "prod",
    renderWorkers: renderWorkersOf(raw.site?.renderWorkers),
  };
}

const DEFAULT_RENDER_WORKERS = 2;

/**
 * Without `site.publicUrl`, a local run (`environment: "dev"`) uses the dev server's address, so Open Graph tags
 * resolve there. In production every unfurl and oEmbed URL would point at localhost, so the site doesn't start.
 */
function publicUrlOf(raw: RawConfig): string {
  const url = raw.site?.publicUrl;
  if (url) return url.replace(/\/$/, "");
  if (raw.environment !== "dev") throw new Error("[site] site.publicUrl must be set outside dev, e.g. https://statsify.net");
  return "http://localhost:7828";
}

/** 1, 2 or 3; anything else is a mistake in `config.js`, and the site doesn't start. */
function renderWorkersOf(value: unknown): number {
  if (value === undefined) return DEFAULT_RENDER_WORKERS;
  if (value === 1 || value === 2 || value === 3) return value;
  throw new Error(`[site] site.renderWorkers must be 1, 2 or 3, not ${JSON.stringify(value)}`);
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
