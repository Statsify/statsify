/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as Sentry from "@sentry/node";
import { CommandListener } from "#lib/command.listener";
import { CommandLoader, CommandPoster, I18nLoaderService } from "@statsify/discord";
import { Container } from "typedi";
import { FontLoaderService } from "#services";
import { InteractionServer, RestClient, WebsocketShard } from "tiny-discord";
import { Logger } from "@statsify/logger";
import { VerifyCommand } from "#commands/verify.command";
import { WinterThemeService } from "@statsify/rendering";
import { config } from "@statsify/util";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const logger = new Logger("discord-bot");
const handleError = logger.error.bind(logger);

process.on("uncaughtException", handleError);
process.on("unhandledRejection", handleError);

const sentryDsn = config("sentry.discordBotDsn", { required: false });

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [new Sentry.Integrations.Http({ tracing: false, breadcrumbs: true })],
    normalizeDepth: 3,
    tracesSampleRate: config("sentry.tracesSampleRate"),
    environment: config("environment"),
  });
}

await Promise.all(
  [I18nLoaderService, FontLoaderService, WinterThemeService].map((service) => Container.get(service).init())
);

const rest = new RestClient({ token: config("discordBot.token"), timeout: 60 * 1000 });
Container.set(RestClient, rest);

const commands = await CommandLoader.load(join(__dirname, "./commands"));

const poster = Container.get(CommandPoster);

await poster.post(
  commands,
  config("discordBot.applicationId"),
  config("discordBot.testingGuild", { required: false })
);

const port = config("discordBot.port", { required: false });

const listener = CommandListener.create(
  port ?
    new InteractionServer({ key: config("discordBot.publicKey")! }) :
    new WebsocketShard({ token: config("discordBot.token"), intents: 1 }),
  rest,
  commands
);

// Register universal component listeners that never reset
const verifyCommand = Container.get(VerifyCommand);
verifyCommand.registerComponentListeners(listener);

await listener.listen();
