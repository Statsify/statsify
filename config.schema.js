/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

/**
 * @type {import("@statsify/util").Config}
 */
export default {
  database: {
    mongoUri: "mongodb://statsify:statsify@localhost:27017/statsify?authSource=admin",
    redisUrl: "redis://:statsify@localhost:6379",
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
  site: {
    apiKey: "",
    publicUrl: "https://statsify.net",
    hypixelBudget: 15,
    turnstile: {
      siteKey: "",
      secretKey: "",
    },
    renderWorkers: 2,
  },
  sentry: {
    discordBotDsn: "",
    apiDsn: "",
    verifyServerDsn: "",
    supportBotDsn: "",
    siteDsn: "",
    tracesSampleRate: 1,
  },
  environment: "dev",
};
