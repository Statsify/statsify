/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as Sentry from "@sentry/node";
import { CommandListener } from "#lib";
import {
  CommandLoader,
  CommandPoster,
  EventLoader,
  I18nLoaderService,
} from "@statsify/discord";
import { Container } from "typedi";
import {
  FontLoaderService,
  MongoLoaderService,
  TagService,
  TicketService,
} from "#services";
import { GatewayIntentBits } from "discord-api-types/v10";
import { Logger } from "@statsify/logger";
import { RestClient, WebsocketShard } from "tiny-discord";
import { WinterThemeService } from "@statsify/rendering";
import { config } from "@statsify/util";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { setGlobalOptions } from "@typegoose/typegoose";
import "reflect-metadata";

const __dirname = dirname(fileURLToPath(import.meta.url));

const logger = new Logger("support-bot");
const handleError = logger.error.bind(logger);

process.on("uncaughtException", handleError);
process.on("unhandledRejection", handleError);

setGlobalOptions({ schemaOptions: { _id: false } });

const sentryDsn = await config("sentry.supportBotDsn", { required: false });

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [new Sentry.Integrations.Http({ tracing: false, breadcrumbs: true })],
    normalizeDepth: 3,
    tracesSampleRate: await config("sentry.tracesSampleRate"),
    environment: await config("environment"),
  });
}

const rest = new RestClient({ token: await config("supportBot.token") });
Container.set(RestClient, rest);

await Promise.all(
  [I18nLoaderService, FontLoaderService, MongoLoaderService, WinterThemeService].map((service) =>
    Container.get(service).init()
  )
);

const commands = await CommandLoader.load(join(__dirname, "./commands"));

const tags = await Container.get(TagService).fetch();
tags.forEach((tag) => commands.set(tag.name, tag));

const poster = Container.get(CommandPoster);

await poster.post(
  commands,
  await config("supportBot.applicationId"),
  await config("supportBot.guild")
);

const websocket = new WebsocketShard({
  token: await config("supportBot.token"),
  intents:
    GatewayIntentBits.Guilds |
    GatewayIntentBits.GuildMessages |
    GatewayIntentBits.GuildMembers |
    GatewayIntentBits.MessageContent,
});

await EventLoader.load(websocket, join(__dirname, "./events"));
const listener = CommandListener.create(websocket, rest, commands);
Container.get(TicketService).init();

await listener.listen();
