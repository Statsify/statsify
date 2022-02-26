import { config } from 'dotenv';

config({ path: '../../.env' });

import { InteractionServer } from 'tiny-discord';

async function bootstrap() {
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
