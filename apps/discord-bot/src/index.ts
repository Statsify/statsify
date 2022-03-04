import { CommandLoader } from '@statsify/discord';
import { config } from 'dotenv';
import 'reflect-metadata';
import { InteractionServer } from 'tiny-discord';

config({ path: '../../.env' });

async function bootstrap() {
  CommandLoader.load('./dist/commands');

  const server = new InteractionServer({ key: process.env.DISCORD_BOT_PUBLIC_KEY });

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
