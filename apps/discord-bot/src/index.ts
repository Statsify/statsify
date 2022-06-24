/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

// TODO Remove this when/if we migrate to ESM
/* eslint-disable unicorn/prefer-module */

import Container from "typedi";
import { CommandListener } from "./command.listener";
import { CommandLoader, CommandPoster } from "@statsify/discord";
import { FontLoaderService, I18nLoaderService } from "#services";
import { InteractionServer, RestClient, WebsocketShard } from "tiny-discord";
import { env } from "@statsify/util";
import { join } from "node:path";
import "reflect-metadata";

async function bootstrap() {
  await Promise.all(
    [I18nLoaderService, FontLoaderService].map((service) => Container.get(service).init())
  );

  const rest = new RestClient({ token: env("DISCORD_BOT_TOKEN") });
  const commands = await CommandLoader.load(join(__dirname, "./commands"));

  const poster = new CommandPoster(rest);

  await poster.post(
    commands,
    env("DISCORD_BOT_APPLICATION_ID"),
    env("DISCORD_BOT_GUILD")
  );

  const port = env("DISCORD_BOT_PORT", { required: false });

  const listener = CommandListener.create(
    port
      ? new InteractionServer({ key: env("DISCORD_BOT_PUBLIC_KEY")! })
      : new WebsocketShard({ token: env("DISCORD_BOT_TOKEN"), intents: 1 }),
    rest,
    commands
  );

  await listener.listen();
}

bootstrap();
