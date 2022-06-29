/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

module.exports = {
  database: {
    mongoURI: "",
    redisURL: "",
  },
  hypixelAPI: {
    key: "",
    timeout: 5000,
  },
  statsifyAPI: {
    port: 3000,
    // Where to store user media, ex: badges
    mediaRoot: "",
    ignoreAuth: false,
  },
  discordBot: {
    // A discord bot port is required to run the bot in interaction url mode, leave it blank to run the bot through the gateway/websocket
    port: undefined,
    publicKey: "",
    token: "",
    applicationID: "",
    testingGuild: "",
  },
  apiClient: {
    key: "",
    route: "http://localhost:3000/api",
  },
  verifyServer: {
    hostIP: "localhost",
  },
  rankEmojis: {
    botToken: "",
  },
  sentry: {
    discordBotDSN: "",
    apiDSN: "",
    verifyServerDSN: "",
  },
  // Can be 'dev', 'beta', or 'prod'
  nodeEnv: "dev",
};
