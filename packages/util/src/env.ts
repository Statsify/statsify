/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { config } from "dotenv";

config({ path: "../../.env" });

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
}

export interface EnvOptions<T extends keyof Environment> {
  required?: boolean;
  default?: Environment[T];
}

export const env = <T extends keyof Environment>(
  key: T,
  { required = true, default: defaultValue }: EnvOptions<T> = {}
): Environment[T] => {
  const value = (process.env[key] as string) || undefined;

  const isValueDefined = value !== undefined && value !== "";

  if (!isValueDefined) {
    if (defaultValue) return defaultValue;

    if (required)
      throw new Error(
        `Missing required environment variable: ${key}. Add ${key} to your .env`
      );
  }

  //Convert value to the correct type
  if (isValueDefined && !Number.isNaN(+value) && `${+value}` === value)
    return +value as Environment[T];

  if (value === "true" || value === "false")
    return (value === "true") as unknown as Environment[T];

  return value as Environment[T];
};
