/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as Sentry from "@sentry/node";
import { API } from "@discordjs/core/http-only";
import { CommandListener } from "#lib/command.listener";
import {
  CommandPoster,
  I18nLoaderService,
  InteractionServer,
  createDiscordApi,
  loadCommands,
} from "@statsify/discord";
import { Container } from "typedi";
import { FontLoaderService } from "#services";
import { GatewayIntentBits } from "discord-api-types/v10";
import { Logger } from "@statsify/logger";
import { WebSocketManager } from "@discordjs/ws";
import { VerifyCommand } from "#commands/verify.command";
import { config } from "@statsify/util";
import { join } from "node:path";

const directory = import.meta.dirname;

const logger = new Logger("discord-bot");
const handleError = logger.error.bind(logger);

process.on("uncaughtException", handleError);
process.on("unhandledRejection", handleError);

const sentryDsn = await config("sentry.discordBotDsn", { required: false });

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [new Sentry.Integrations.Http({ tracing: false, breadcrumbs: true })],
    normalizeDepth: 3,
    tracesSampleRate: await config("sentry.tracesSampleRate"),
    environment: await config("environment"),
  });
}

await Promise.all(
  [I18nLoaderService, FontLoaderService].map((service) => Container.get(service).init())
);

const token = await config("discordBot.token");
const api = createDiscordApi(token, { timeout: 60 * 1000 });
Container.set(API, api);

const commands = await loadCommands(join(directory, "./commands"));

const poster = Container.get(CommandPoster);

await poster.post(
  commands,
  await config("discordBot.applicationId"),
  await config("discordBot.testingGuild", { required: false })
);

const port = await config("discordBot.port", { required: false });

const listener = CommandListener.create(
  port ?
    new InteractionServer(await config("discordBot.publicKey")) :
    new WebSocketManager({ token, intents: GatewayIntentBits.Guilds, rest: api.rest }),
  api,
  commands
);

// Register universal component listeners that never reset
const verifyCommand = Container.get(VerifyCommand);
verifyCommand.registerComponentListeners(listener);

await listener.listen();
