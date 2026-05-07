/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as Sentry from "@sentry/node";
import { Logger } from "@statsify/logger";
import { type ServerClient, createServer, states } from "minecraft-protocol";
import { UserLogo, VerifyCode } from "@statsify/schemas";
import { config, formatTime } from "@statsify/util";
import { connect } from "mongoose";
import { createRequire } from "node:module";
import { generateCode } from "./generate-code.js";
import { getLogoPath } from "@statsify/assets";
import { getModelForClass } from "@typegoose/typegoose";
import { readFileSync } from "node:fs";

const logger = new Logger("verify-server");
const require = createRequire(import.meta.url);
const minecraftProtocolRequire = createRequire(require.resolve("minecraft-protocol"));
const minecraftData = minecraftProtocolRequire("minecraft-data") as (
  protocolVersion: number
) => unknown;

const handleError = logger.error.bind(logger);

process.on("uncaughtException", handleError);
process.on("unhandledRejection", handleError);

const codeCreatedMessage = (code: string, time: Date) => {
  // Add on the expirey time to the time provided by mongo
  let expireTime = time.getTime() + 300 * 1000;
  expireTime -= Date.now();

  return `§9§lStatsify Verification Server\n\n§r§7Your verification code is §c§l${code}§r§7\n\nHead back over to §5Discord §r§7and run §f§l/verify§r§7\nYour code will expire in §8${formatTime(
    expireTime,
    { short: false }
  )}§r§7.`;
};

const supportsFeature = (client: ServerClient, feature: string) => {
  const supportFeature = (client as ServerClient & {
    supportFeature?: (feature: string) => boolean;
  }).supportFeature;

  return supportFeature?.(feature) ?? false;
};

const clientDetails = (client: ServerClient) =>
  `id=${client.id} username=${client.username ?? "unknown"} uuid=${
    client.uuid ?? "unknown"
  } version=${client.version} protocol=${client.protocolVersion} state=${client.state}`;

const isSupportedProtocol = (protocolVersion: number) => Boolean(minecraftData(protocolVersion));

const sentryDsn = await config("sentry.verifyServerDsn", { required: false });

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [new Sentry.Integrations.Mongo({ useMongoose: true })],
    normalizeDepth: 3,
    tracesSampleRate: await config("sentry.tracesSampleRate"),
    environment: await config("environment"),
  });
}

await connect(await config("database.mongoUri"));

const verifyCodesModel = getModelForClass(VerifyCode);

const serverLogo = readFileSync(getLogoPath(UserLogo.DEFAULT, 64), {
  encoding: "base64",
});

const server = createServer({
  host: await config("verifyServer.hostIp"),
  maxPlayers: 2,
  motd: "§9§lStatsify Verification",
  version: false,
  errorHandler: (_, error) => {
    logger.error(error);
  },
  beforePing: (response) => {
    // Remove the version from the response
    response.version.name = "";

    // Set the server icon
    response.favicon = `data:image/png;base64,${serverLogo}`;
  },
});

logger.log("Server Started");

server.on("connection", (client) => {
  logger.verbose(`Connection opened: ${clientDetails(client)}`);

  client.prependOnceListener("set_protocol", (packet: {
    nextState: number;
    protocolVersion: number;
  }) => {
    if (packet.nextState !== 2 || isSupportedProtocol(packet.protocolVersion)) return;

    logger.warn(
      `Unsupported Minecraft protocol attempted login: ` +
      `protocol=${packet.protocolVersion} ${clientDetails(client)}`
    );

    // minecraft-protocol ends unsupported handshakes before setting LOGIN state.
    // Moving to LOGIN first lets the client receive a visible disconnect packet
    // instead of continuing into mismatched configuration registry data.
    client.state = states.LOGIN;
    client.removeAllListeners("login_start");
  });

  client.on("state", (newState, oldState) => {
    logger.verbose(`Connection state changed: ${clientDetails(client)} ${oldState} -> ${newState}`);
  });

  client.on("error", (error) => {
    logger.error(`Connection error: ${clientDetails(client)}`);
    logger.error(error);
  });

  client.on("end", (reason) => {
    logger.verbose(`Connection ended: ${clientDetails(client)} reason=${reason ?? "unknown"}`);
  });
});

server.on("playerJoin", async (client) => {
  try {
    logger.verbose(
      `${client.username} [${client.uuid}] has joined: ${clientDetails(client)} ` +
      `hasConfigurationState=${supportsFeature(client, "hasConfigurationState")} ` +
      `chatPacketsUseNbtComponents=${supportsFeature(client, "chatPacketsUseNbtComponents")}`
    );

    const uuid = client.uuid.replaceAll("-", "");

    const previousVerifyCode = await verifyCodesModel.findOne({ uuid }).lean().exec();

    if (previousVerifyCode) {
      const message = codeCreatedMessage(
        previousVerifyCode.code,
        previousVerifyCode.expireAt
      );

      logger.verbose(
        `Disconnecting existing verification code client: ${clientDetails(client)} ` +
        `messageLength=${message.length}`
      );

      return client.end(message);
    }

    const code = await generateCode(verifyCodesModel);
    const verifyCode = await verifyCodesModel.create(new VerifyCode(uuid, code));
    const message = codeCreatedMessage(verifyCode.code, verifyCode.expireAt);

    logger.verbose(
      `Disconnecting new verification code client: ${clientDetails(client)} ` +
      `messageLength=${message.length}`
    );

    client.end(message);
    logger.verbose(`${client.username} has been assigned to the code ${verifyCode.code}`);
  } catch (error) {
    logger.error(error);
  }
});
