/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Logger, setRequestAttributes, withRequestEvent } from "@statsify/logger";
import { UserLogo, VerifyCode } from "@statsify/schemas";
import { config, formatTime } from "@statsify/util";
import { connect } from "mongoose";
import { createServer } from "minecraft-protocol";
import { generateCode } from "./generate-code.js";
import { getLogoPath } from "@statsify/assets";
import { getModelForClass } from "@typegoose/typegoose";
import { readFileSync } from "node:fs";

const logger = new Logger("verify-server");

process.on("uncaughtException", (error) => logger.error(error));
process.on("unhandledRejection", (reason) => logger.error(reason));

const SLOW_LOGIN_MS = 2500;

const codeCreatedMessage = (code: string, time: Date) => {
  // Add on the expirey time to the time provided by mongo
  let expireTime = time.getTime() + 300 * 1000;
  expireTime -= Date.now();

  return `§9§lStatsify Verification Server\n\n§r§7Your verification code is §c§l${code}§r§7\n\nHead back over to §5Discord §r§7and run §f§l/verify§r§7\nYour code will expire in §8${formatTime(
    expireTime,
    { short: false }
  )}§r§7.`;
};

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

server.on("login", (client) =>
  withRequestEvent(
    async () => {
      const uuid = client.uuid.replaceAll("-", "");
      setRequestAttributes({ "statsify.player": uuid });

      const previousVerifyCode = await verifyCodesModel.findOne({ uuid }).lean().exec();

      if (previousVerifyCode) {
        setRequestAttributes({ "statsify.verify.code": "existing" });
        return client.end(
          codeCreatedMessage(previousVerifyCode.code, previousVerifyCode.expireAt)
        );
      }

      const code = await generateCode(verifyCodesModel);
      const verifyCode = await verifyCodesModel.create(new VerifyCode(uuid, code));

      setRequestAttributes({ "statsify.verify.code": "created" });
      client.end(codeCreatedMessage(verifyCode.code, verifyCode.expireAt));
    },
    () => ({ message: "login", slowMs: SLOW_LOGIN_MS })
  )
);
