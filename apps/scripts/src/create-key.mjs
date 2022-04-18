import { createHash, randomUUID } from 'crypto';
import inquirer from 'inquirer';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

/**
 *
 * @param {{
 *  name: string;
 *  key?: string;
 *  role?: 0 | 1
 *  limit?: number;
 * }} param0
 */
async function createKey({ name, key, role, limit }) {
  const hash = createHash('sha256').update(key).digest('hex');
  await redis.hmset(`key:${hash}`, 'name', name, 'role', role, 'limit', limit, 'requests', 0);
}

const roles = ['user', 'admin'];

async function bootstrap() {
  const { name, key, role, limit } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'What is your name?',
    },
    {
      type: 'input',
      name: 'key',
      message: 'What is the api key?',
      default: () => randomUUID(),
    },
    {
      type: 'list',
      name: 'role',
      message: 'What is the role of the api key?',
      choices: roles,
      default: 'admin',
    },
    {
      type: 'number',
      name: 'limit',
      message: 'What is the limit for requests per minute?',
      default: 120,
    },
  ]);

  await createKey({ name, key, role, limit });

  console.log(`Created key ${key} with role ${role} and limit ${limit}`);
  process.exit(0);
}

bootstrap();
