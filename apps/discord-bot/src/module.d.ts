/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_KEY: string;
      API_ROUTE: string;
      DISCORD_BOT_PUBLIC_KEY: string;
      DISCORD_BOT_PORT?: number;
      DISCORD_BOT_TOKEN: string;
      DISCORD_BOT_APPLICATION_ID: string;
      DISCORD_BOT_GUILD?: string;
    }
  }
}

export {};
