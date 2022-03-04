import { CommandLoader, CommandPoster } from '@statsify/discord';
import { config } from 'dotenv';
import path from 'path';
import 'reflect-metadata';
import { InteractionServer, RestClient } from 'tiny-discord';

config({ path: '../../.env' });

async function bootstrap() {
  const client = new RestClient({ token: process.env.DISCORD_BOT_TOKEN });
  const server = new InteractionServer({ key: process.env.DISCORD_BOT_PUBLIC_KEY });

  const commands = await CommandLoader.load(path.join(__dirname, './commands'));
  const poster = new CommandPoster(client);

  await poster.post(
    commands,
    process.env.DISCORD_BOT_APPLICATION_ID,
    process.env.DISCORD_BOT_GUILD
  );

  server.on('interaction', (interaction) => {
    console.log(interaction);
    return {
      type: 4,
      data: {
        content: 'test',
      },
    };
  });

  await server.listen(process.env.DISCORD_BOT_PORT);
}

bootstrap();
