// ! I (ugcodrr) am not liable for any damages or loss of data caused by this script.

import { exec } from 'child_process';
import { readdirSync, rmSync, statSync } from 'fs';
import inquirer from 'inquirer';
import path from 'path';
import { fileURLToPath } from 'url';
import util from 'util';
import { inquirerConfirmation, inquirerLogger } from './constants.js';

const __exec = util.promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const flatten = (lists) => lists.reduce((a, b) => a.concat(b), []);

const getDirectories = (srcpath) =>
  readdirSync(srcpath)
    .map((file) => path.join(srcpath, file))
    .filter((path) => statSync(path).isDirectory());

const getDirectoriesRecursive = (srcpath) => [
  srcpath,
  ...flatten(getDirectories(srcpath).map(getDirectoriesRecursive)),
];

const purge = async () => {
  const { method } = await inquirer.prompt([
    {
      type: 'list',
      name: 'method',
      message: 'Purge Action?',
      choices: ['node_modules', '.turbo', 'dist', 'coverage', 'swc', 'ALL'],
      default: 'create',
    },
  ]);

  const activeFolders = await getDirectoriesRecursive(path.resolve(__dirname, '../../../'));

  if (method === 'node_modules') await nodeModules(activeFolders);
  else if (method === '.turbo') await turboRepo(activeFolders);
  else if (method === 'dist') await dist(activeFolders);
  else if (method === 'coverage') await coverage(activeFolders);
  else if (method === 'swc') await swc(activeFolders);
  else if (method === 'ALL') await all(activeFolders);
  process.exit(0);
};

const nodeModules = async (existingFolders) => {
  if (!(await inquirerConfirmation())) return;

  await existingFolders
    .filter((folder) => folder.includes('node_modules'))
    .forEach((folder) => deleteDirectories(folder));

  if (!(await inquirerConfirmation('Recreate node_modules'))) return;

  await __exec('yarn', {
    shell: true,
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '../../../'),
  });

  inquirerLogger('Recreater', 'node_modules installed');
};

const turboRepo = async (existingFolders) => {
  if (!(await inquirerConfirmation())) return;

  await existingFolders
    .filter((folder) => folder.includes('.turbo'))
    .forEach((folder) => deleteDirectories(folder));
};

const dist = async (existingFolders) => {
  if (!(await inquirerConfirmation())) return;

  await existingFolders
    .filter((folder) => folder.includes('dist'))
    .forEach((folder) => deleteDirectories(folder));

  if (!(await inquirerConfirmation('Recreate dist'))) return;

  await __exec('yarn build', {
    shell: true,
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '../../../'),
  });

  inquirerLogger('Recreater', 'monorepo freshly built');
};

const coverage = async (existingFolders) => {
  if (!(await inquirerConfirmation())) return;

  await existingFolders
    .filter((folder) => folder.includes('coverage'))
    .forEach((folder) => deleteDirectories(folder));
};
const swc = async (existingFolders) => {
  if (!(await inquirerConfirmation())) return;

  await existingFolders
    .filter((folder) => folder.includes('swc'))
    .forEach((folder) => deleteDirectories(folder));
};

const all = async () => {
  await nodeModules();
  await turboRepo();
  await dist();
  await coverage();
  await swc();
};

const deleteDirectories = (file) => rmSync(file, { recursive: true, force: true });

purge();
