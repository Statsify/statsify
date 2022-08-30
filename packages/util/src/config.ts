/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import type { DeepFlatten } from "./flat/mod.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export interface Config {
  database: {
    /**
     * The MongoDB Uri used for the whole project
     * @example mongodb://localhost:27017
     */
    mongoUri: string;
    /**
     * The Redis Url used for leaderboards and api keys
     * @example redis://localhost:6379
     */
    redisUrl: string;
  };

  hypixelApi: {
    /**
     * The Hypixel API Key used for making requests to the Hypixel API
     */
    key: string;
    /**
     * How much time in milliseconds to wait before cancelling a Hypixel API request
     * @example 5000
     */
    timeout: number;
  };

  api: {
    /**
     * What port to run the Statsify API on
     */
    port: number;
    /**
     * What location to store things like badges
     * @example /tmp
     */
    mediaRoot: string;
    /**
     * Whether or not to ignore authentication for the Statsify API
     */
    ignoreAuth?: boolean;
  };

  discordBot: {
    /**
     * What port to run the Discord Bot on, this is only required if you want to run the Discord Bot in Interaction Url mode
     */
    port?: number;
    /**
     * Discord Bot Public Key
     */
    publicKey: string;
    /**
     * Discord Bot token
     */
    token: string;
    /**
     * Discord Bot Application Id
     */
    applicationId: string;
    /**
     * The guild id to post slash commands to in development mode
     */
    testingGuild: string;
  };

  supportBot: {
    /**
     * The channel id where the message with buttons to create tickets is sent
     */
    createTicketChannel: string;

    /**
     * The channel id where ticket logs are sent
     */
    ticketLogsChannel: string;

    /**
     * The category id where ticket channels are created
     */
    ticketCategory: string;

    /**
     * The channel id where the welcome messages are sent
     */
    welcomeChannel: string;

    /**
     * The channel id where unverified members are sent
     */
    unverifiedChannel: string;

    /**
     * The channel id for where to send the hypixel api status message
     */
    hypixelApiStatusChannel: string;

    /**
     * The channel id for premium logs
     */
    premiumLogsChannel: string;

    /**
     * The member role id
     */
    memberRole: string;

    /**
     * The premium role id
     */
    premiumRole: string;

    /**
     * The nitro booster role id
     */
    nitroBoosterRole: string;

    /**
     * The patreon role id
     */
    patreonRole: string;

    /**
     * The iron tier role id
     */
    ironRole: string;

    /**
     * The gold tier role id
     */
    goldRole: string;

    /**
     * The diamond tier role id
     */
    diamondRole: string;

    /**
     * The emerald tier role id
     */
    emeraldRole: string;

    /**
     * The netherite tier role id
     */
    netheriteRole: string;

    /**
     * The guild id where the support bot is located
     */
    guild: string;

    /**
     * Support Bot Public Key
     */
    publicKey: string;
    /**
     * Support Bot token
     */
    token: string;
    /**
     * Support Bot Application Id
     */
    applicationId: string;
  };

  apiClient: {
    /**
     * The api key used by the Discord Bot and Support Bot to connect to the Statsify API
     */
    key: string;
    /**
     * The route to use for the Statsify API
     * @example http://localhost:3000
     */
    route: string;
  };

  verifyServer: {
    /**
     * What ip to listen on for the verify server
     * @example localhost
     */
    hostIp: string;
  };

  rankEmojis?: {
    /**
     * The Discord Bot token used to create servers for the rank emojis
     */
    botToken?: string;
  };

  sentry?: {
    /**
     * The Sentry Dsn used by the Discord Bot
     */
    discordBotDsn?: string;
    /**
     * The Sentry Dsn used by the Statsify API
     */
    apiDsn?: string;
    /**
     * The Sentry Dsn used by the Verify Server
     */
    verifyServerDsn?: string;

    /**
     * The Sentry Dsn used by the Support Bot
     */
    supportBotDsn?: string;

    /**
     * The percentage of transactions to send to Sentry
     */
    tracesSampleRate?: number;
  };

  /**
   * The current environment the bot is running in
   * @example dev
   */
  environment: "dev" | "beta" | "prod";
}

type FlatConfig = DeepFlatten<Config>;

let cfg: Config;

if (existsSync(join(__dirname, "../../../config.js"))) {
  cfg = ((await import(join(__dirname, "../../../config.js"))) as { default: Config })
    .default;
} else {
  throw new Error("No config file detected!");
}

export interface ConfigOptions<T extends keyof FlatConfig> {
  required?: boolean;
  default?: FlatConfig[T];
}

export const config = <T extends keyof FlatConfig>(
  key: T,
  { required = true, default: defaultValue }: ConfigOptions<T> = {}
): FlatConfig[T] => {
  // Don't load the config while testing
  if (process.env.JEST_WORKER_ID) return defaultValue as FlatConfig[T];

  const value =
    (key as string).split(".").reduce((a: any, b) => a?.[b], cfg) || undefined;

  const isValueDefined = value !== undefined && value !== "";

  if (!isValueDefined) {
    if (defaultValue) return defaultValue;

    if (required)
      throw new Error(
        `Missing required environment variable: ${key as string} | Add ${
          key as string
        } to your config`
      );
  }

  return value;
};
