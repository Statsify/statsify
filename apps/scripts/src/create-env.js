import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import inquirer from 'inquirer';

async function promptEnv() {
  const questions = [];

  let currentFile = '';

  if (existsSync('../../.env')) {
    currentFile = await readFile('../../.env');

    await writeFile('../../.env.bak', currentFile);
  }

  const schemaFile = await readFile('../../.env.schema');

  const currentValues = currentFile
    ? currentFile
        .toString()
        .split('\n')
        .filter((l) => !l.startsWith('#'))
        .map((l) => l.split('='))
    : undefined;

  const schema = schemaFile
    .toString()
    .split('\n')
    .filter((l) => !l.startsWith('#'))
    .map((l) => l.split('='));

  for (let [key, val] of schema) {
    const currentVal = currentValues.find((l) => l[0] == key);
    const defaultVal = currentVal[1] ?? val;

    questions.push({
      type: 'input',
      name: key,
      message: `Value for ${key}`,
      default: defaultVal,
    });
  }

  const ipt = await inquirer.prompt(questions);

  let str = Object.entries(ipt)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  if (str != currentFile.toString()) {
    await writeFile('../../.env', str);
  }
}

promptEnv();
