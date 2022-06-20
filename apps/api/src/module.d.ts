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
      API_PORT: number;
      API_MEDIA_ROOT: string;
      IGNORE_AUTH?: string;
      MONGODB_URI: string;
      REDIS_URL: string;
      HYPIXEL_API_KEY: string;
      HYPIXEL_API_TIMEOUT: number;
    }
  }
}

export {};
