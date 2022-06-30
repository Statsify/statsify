/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as Sentry from "@sentry/node";
import Container from "typedi";
import { CommandListener } from "#lib/command.listener";
import {
  CommandLoader,
  CommandPoster,
  EventLoader,
  I18nLoaderService,
} from "@statsify/discord";
import { GatewayIntentBits } from "discord-api-types/v10";
import { MongoLoaderService, TagService, TicketService } from "#services";
import { RestClient, WebsocketShard } from "tiny-discord";
import { config } from "@statsify/util";
import { join } from "node:path";
import { setGlobalOptions } from "@typegoose/typegoose";
import "@sentry/tracing";
import "reflect-metadata";

async function bootstrap() {
  setGlobalOptions({ schemaOptions: { _id: false } });

  const sentryDsn = config("sentry.supportBotDsn", { required: false });

  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      integrations: [new Sentry.Integrations.Http({ tracing: false, breadcrumbs: true })],
      normalizeDepth: 3,
      tracesSampleRate: 1,
      environment: config("environment"),
    });
  }

  const rest = new RestClient({ token: config("supportBot.token") });
  Container.set(RestClient, rest);

  await Promise.all(
    [I18nLoaderService, MongoLoaderService].map((service) =>
      Container.get(service).init()
    )
  );

  const commands = await CommandLoader.load(join(__dirname, "./commands"));

  const tags = await Container.get(TagService).fetch();
  tags.forEach((tag) => commands.set(tag.name, tag));

  const poster = Container.get(CommandPoster);

  await poster.post(
    commands,
    config("supportBot.applicationId"),
    config("supportBot.guild")
  );

  const websocket = new WebsocketShard({
    token: config("supportBot.token"),
    intents:
      GatewayIntentBits.Guilds |
      GatewayIntentBits.GuildMessages |
      GatewayIntentBits.GuildMembers |
      GatewayIntentBits.MessageContent,
  });

  await EventLoader.load(websocket, join(__dirname, "./events"));
  const listener = CommandListener.create(websocket, rest, commands);

  await Container.get(TicketService).init();
  await listener.listen();
}

bootstrap();
