import { existsSync } from 'fs';
import { copyFile, readFile, writeFile } from 'fs/promises';
import inquirer from 'inquirer';

async function promptEnv() {
  const questions = [];

  const schemaFile = await readFile('../../.env.schema');

  const schema = schemaFile
    .toString()
    .split('\n')
    .filter((l) => !l.startsWith('#'));

  for (const line of schema) {
    const [key, val] = line.split('=');

    questions.push({
      type: 'input',
      name: key,
      message: `Value for ${key}`,
      default: val,
    });
  }

  const userInput = await inquirer.prompt(questions);

  let str = '';
  for (const key in userInput) {
    str += `${key}=${userInput[key]}\n`;
  }

  if (existsSync('../../.env')) {
    await copyFile('../../.env', '../../.env.bak');
  }

  await writeFile('../../.env', str);
}

promptEnv();
