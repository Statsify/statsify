/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as Sentry from "@sentry/node";
import minecraftProtocol, { createServer, states } from "minecraft-protocol";
import { Logger } from "@statsify/logger";
import { UserLogo, VerifyCode } from "@statsify/schemas";
import { config, formatTime } from "@statsify/util";
import { connect } from "mongoose";
import { generateCode } from "./generate-code.js";
import { getLogoPath } from "@statsify/assets";
import { getModelForClass } from "@typegoose/typegoose";
import { readFileSync } from "node:fs";

const logger = new Logger("verify-server");

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
  // Players are kicked during login, so only the handshake, ping and login packets have to match their version.
  // Those rarely change, so versions newer than minecraft-protocol use the packets of the newest one it supports.
  fallbackVersion: minecraftProtocol.supportedVersions.at(-1),
  errorHandler: (_, error) => {
    logger.error(error);
  },
  beforePing: (response, client) => {
    // Remove the version from the response, and show the server as compatible with every version
    response.version.name = "";
    response.version.protocol = client.protocolVersion;

    // Set the server icon
    response.favicon = `data:image/png;base64,${serverLogo}`;
  },
  beforeLogin: (client) => {
    // Mojang has verified the player by now, so their code is sent in a login disconnect.
    // The configuration and play states need registry data for the client's version,
    // so every packet but compress is dropped and the client never receives login success.
    const { write, end } = client;

    client.write = (name, params) => {
      if (name === "compress") write.call(client, name, params);
    };

    client.end = (reason) => {
      client.write = write;
      // minecraft-protocol moves clients older than 1.20.2 to the play state right after login success
      client.state = states.LOGIN;
      end.call(client, reason);
    };
  },
});

logger.log("Server Started");

server.on("login", async (client) => {
  try {
    logger.verbose(
      `${client.username} [${client.uuid}] has joined on protocol ${client.protocolVersion}`
    );

    const uuid = client.uuid.replaceAll("-", "");

    const previousVerifyCode = await verifyCodesModel.findOne({ uuid }).lean().exec();

    if (previousVerifyCode)
      return client.end(
        codeCreatedMessage(previousVerifyCode.code, previousVerifyCode.expireAt)
      );

    const code = await generateCode(verifyCodesModel);
    const verifyCode = await verifyCodesModel.create(new VerifyCode(uuid, code));

    client.end(codeCreatedMessage(verifyCode.code, verifyCode.expireAt));
    logger.verbose(`${client.username} has been assigned to the code ${verifyCode.code}`);
  } catch (error) {
    logger.error(error);
  }
});
