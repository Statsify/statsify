/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { existsSync } from "node:fs";
import { join } from "node:path";

let config: Environment;

interface Environment {
  MONGODB_URI: string;
  REDIS_URL: string;

  HYPIXEL_API_KEY: string;
  HYPIXEL_API_TIMEOUT: number;

  API_PORT: number;
  API_MEDIA_ROOT: string;
  IGNORE_AUTH?: boolean;

  DISCORD_BOT_PORT?: number;
  DISCORD_BOT_PUBLIC_KEY?: string;
  DISCORD_BOT_TOKEN: string;
  DISCORD_BOT_APPLICATION_ID: string;
  DISCORD_BOT_GUILD?: string;

  RANK_EMOJI_DISCORD_BOT_TOKEN?: string;

  API_KEY: string;
  API_ROUTE: string;

  VERIFY_SERVER_IP: string;

  NODE_ENV: "dev" | "beta" | "prod";

  DISCORD_BOT_SENTRY_DSN?: string;
  API_SENTRY_DSN?: string;
  VERIFY_SERVER_SENTRY_DSN?: string;
}

const loadConfig = () => {
  if (existsSync("../../config.json")) {
    return require("../../config.json");
  } else if (existsSync(join(__dirname, "../../../config.js"))) {
    return require(join(__dirname, "../../../config.js"));
  } else {
    throw new Error("No config file detected!");
  }
};

export interface EnvOptions {
  required?: boolean;
  default?: any;
}

export const env = (
  key: string,
  { required = true, default: defaultValue }: EnvOptions = {}
) => {
  if (config === undefined) {
    config = loadConfig();
  }

  const value = key.split(".").reduce((a: any, b) => a?.[b], config) || undefined;

  const isValueDefined = value !== undefined && value !== "";

  if (!isValueDefined) {
    if (defaultValue) return defaultValue;

    if (required)
      throw new Error(
        `Missing required environment variable: ${key}. Add ${key} to your config`
      );
  }

  return value;
};
