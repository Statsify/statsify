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
import { CommandLoader, CommandPoster, I18nLoaderService } from "@statsify/discord";
import { FontLoaderService } from "#services";
import { InteractionServer, RestClient, WebsocketShard } from "tiny-discord";
import { config } from "@statsify/util";
import { join } from "node:path";
import "@sentry/tracing";
import "reflect-metadata";

async function bootstrap() {
  const sentryDsn = config("sentry.discordBotDsn", { required: false });

  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      integrations: [new Sentry.Integrations.Http({ tracing: false, breadcrumbs: true })],
      normalizeDepth: 3,
      tracesSampleRate: 1,
      environment: config("environment"),
    });
  }

  await Promise.all(
    [I18nLoaderService, FontLoaderService].map((service) => Container.get(service).init())
  );

  const rest = new RestClient({ token: config("discordBot.token") });
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
    port
      ? new InteractionServer({ key: config("discordBot.publicKey")! })
      : new WebsocketShard({ token: config("discordBot.token"), intents: 1 }),
    rest,
    commands
  );

  await listener.listen();
}

bootstrap();
