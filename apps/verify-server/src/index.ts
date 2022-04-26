import { createServer } from 'minecraft-protocol';

const server = createServer({
  host: 'localhost',
  maxPlayers: 2,
  motd: 'Hello, Minecraft!',
});

server.on('login', () => {
  console.log('Client connected!');
});
