/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as Sentry from "@sentry/node";
import { Logger } from "@statsify/logger";
import { Integrations as TracingIntegrations } from "@sentry/tracing";
import { UserTier, VerifyCode } from "@statsify/schemas";
import { config, formatTime } from "@statsify/util";
import { connect } from "mongoose";
import { createServer } from "minecraft-protocol";
import { generateCode } from "./generate-code";
import { getLogoPath } from "@statsify/assets";
import { getModelForClass } from "@typegoose/typegoose";
import { readFileSync } from "node:fs";

const logger = new Logger("Verify Server");

const codeCreatedMessage = (code: string, time: Date) => {
  //Add on the expirey time to the time provided by mongo
  let expireTime = time.getTime() + 300 * 1000;
  expireTime -= Date.now();

  return `§9§lStatsify Verification Server\n\n§r§7Your verification code is §c§l${code}§r§7\n\nHead back over to §5Discord §r§7and run §f§l/verify code:${code}§r§7\nYour code will expire in §8${formatTime(
    expireTime,
    { short: false }
  )}§r§7.`;
};

async function bootstrap() {
  const sentryDsn = config("sentry.verifyServerDsn", { required: false });

  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      integrations: [new TracingIntegrations.Mongo({ useMongoose: true })],
      normalizeDepth: 3,
      tracesSampleRate: 1,
      environment: config("environment"),
    });
  }

  await connect(config("database.mongoUri"));

  const verifyCodesModel = getModelForClass(VerifyCode);

  const serverLogo = readFileSync(getLogoPath(UserTier.NONE, 64), {
    encoding: "base64",
  });

  const server = createServer({
    host: config("verifyServer.hostIp"),
    maxPlayers: 2,
    motd: "§9§lStatsify Verification",
    version: false,
    errorHandler: (_, error) => {
      logger.error(error);
    },
    beforePing: (response) => {
      //Remove the version from the response
      response.version.name = "";

      //Set the server icon
      response.favicon = `data:image/png;base64,${serverLogo}`;
    },
  });

  logger.log("Server Started");

  server.on("login", async (client) => {
    try {
      logger.verbose(`${client.username} has joined`);

      const uuid = client.uuid.replaceAll("-", "");

      const previousVerifyCode = await verifyCodesModel.findOne({ uuid }).lean().exec();

      if (previousVerifyCode)
        return client.end(
          codeCreatedMessage(previousVerifyCode.code, previousVerifyCode.expireAt)
        );

      const code = await generateCode(verifyCodesModel);
      const verifyCode = await verifyCodesModel.create(new VerifyCode(uuid, code));

      client.end(codeCreatedMessage(verifyCode.code, verifyCode.expireAt));
      logger.verbose(
        `${client.username} has been assigned to the code ${verifyCode.code}`
      );
    } catch (error) {
      logger.error(error);
    }
  });
}

bootstrap();
