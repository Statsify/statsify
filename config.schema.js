/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/**
 * @type {import("@statsify/util").Config}
 */
module.exports = {
  database: {
    mongoUri: "",
    redisUrl: "",
  },
  hypixelAPI: {
    key: "",
    timeout: 5000,
  },
  api: {
    port: 3000,
    mediaRoot: "",
    ignoreAuth: false,
  },
  discordBot: {
    port: undefined,
    publicKey: "",
    token: "",
    applicationId: "",
    testingGuild: "",
  },
  apiClient: {
    key: "",
    route: "http://localhost:3000/api",
  },
  verifyServer: {
    hostIp: "localhost",
  },
  rankEmojis: {
    botToken: "",
  },
  sentry: {
    discordBotDsn: "",
    apiDsn: "",
    verifyServerDsn: "",
  },
  environment: "dev",
};
