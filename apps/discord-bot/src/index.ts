import { CommandListener, CommandLoader, CommandPoster } from '@statsify/discord';
import { config } from 'dotenv';
import path from 'path';
import 'reflect-metadata';
import { InteractionServer, RestClient, WebsocketShard } from 'tiny-discord';

config({ path: '../../.env' });

async function bootstrap() {
  const client = new RestClient({ token: process.env.DISCORD_BOT_TOKEN });

  const port = process.env.DISCORD_BOT_PORT;

  const listener = port
    ? new CommandListener(new InteractionServer({ key: process.env.DISCORD_BOT_PUBLIC_KEY }), port)
    : new CommandListener(new WebsocketShard({ token: process.env.DISCORD_BOT_TOKEN, intents: 1 }));

  const commands = await CommandLoader.load(path.join(__dirname, './commands'));
  const poster = new CommandPoster(client);

  await poster.post(
    commands,
    process.env.DISCORD_BOT_APPLICATION_ID,
    process.env.DISCORD_BOT_GUILD
  );

  await listener.listen();
}

bootstrap();
