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
  hypixelApi: {
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
  supportBot: {
    createTicketChannel: "",
    ticketLogsChannel: "",
    ticketCategory: "",
    welcomeChannel: "",
    unverifiedChannel: "",
    hypixelApiStatusChannel: "",
    premiumInfoChannel: "",
    premiumLogsChannel: "",
    memberRole: "",
    premiumRole: "",
    nitroBoosterRole: "",
    patreonRole: "",
    ironRole: "",
    goldRole: "",
    diamondRole: "",
    emeraldRole: "",
    netheriteRole: "",
    guild: "",
    publicKey: "",
    token: "",
    applicationId: "",
  },
  apiClient: {
    key: "",
    route: "http://localhost:3000",
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
    supportBotDsn: "",
    tracesSampleRate: 1,
  },
  environment: "dev",
};
