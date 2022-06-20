/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FontLoaderService, I18nLoaderService } from '#services';
import { CommandLoader, CommandPoster } from '@statsify/discord';
import path from 'path';
import 'reflect-metadata';
import { InteractionServer, RestClient, WebsocketShard } from 'tiny-discord';
import Container from 'typedi';
import { CommandListener } from './command.listener';

async function bootstrap() {
  await Promise.all(
    [I18nLoaderService, FontLoaderService].map((service) => Container.get(service).init())
  );

  const rest = new RestClient({ token: process.env.DISCORD_BOT_TOKEN });
  const commands = await CommandLoader.load(path.join(__dirname, './commands'));

  const poster = new CommandPoster(rest);

  await poster.post(
    commands,
    process.env.DISCORD_BOT_APPLICATION_ID,
    process.env.DISCORD_BOT_GUILD
  );

  const port = process.env.DISCORD_BOT_PORT;

  const listener = CommandListener.create(
    port
      ? new InteractionServer({ key: process.env.DISCORD_BOT_PUBLIC_KEY })
      : new WebsocketShard({ token: process.env.DISCORD_BOT_TOKEN, intents: 1 }),
    rest,
    commands
  );

  await listener.listen();
}

bootstrap();
