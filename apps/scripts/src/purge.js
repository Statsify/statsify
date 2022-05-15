import { exec as _exec } from 'child_process';
import { rm } from 'fs/promises';
import inquirer from 'inquirer';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { fetchWorkspaces, inquirerConfirmation, inquirerLogger, ROOT } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 *
 * @param {string} script
 */
const exec = (script) =>
  promisify(_exec)(script, {
    shell: true,
    stdio: 'inherit',
    cwd: resolve(__dirname, '../../../'),
  });

const workspaces = [...(await fetchWorkspaces('apps')), ...(await fetchWorkspaces('packages'))];

/**
 *
 * @param {string} path
 * @param {string[]} _workspaces
 * @returns {Promise<void>}
 */
function deleteFromWorkspaces(path, _workspaces = workspaces) {
  return Promise.all(
    _workspaces.map((workspace) => rm(join(workspace, path), { recursive: true, force: true }))
  );
}

const purge = async () => {
  const { method } = await inquirer.prompt([
    {
      type: 'list',
      name: 'method',
      message: 'Purge Action?',
      choices: ['node_modules', '.turbo', 'dist', 'coverage', '.swc', 'ALL'],
      default: 'create',
    },
  ]);

  if (!(await inquirerConfirmation())) return;

  if (method === 'node_modules') await nodeModules();
  else if (method === '.turbo') await turboRepo();
  else if (method === 'dist') await dist();
  else if (method === 'coverage') await coverage();
  else if (method === '.swc') await swc();
  else if (method === 'ALL') await all();
  process.exit(0);
};

const nodeModules = async () => {
  await deleteFromWorkspaces('node_modules', [ROOT, ...workspaces]);

  if (!(await inquirerConfirmation('Recreate node_modules'))) return;

  await exec('yarn');

  inquirerLogger('Recreater', 'node_modules installed');
};

const dist = async () => {
  await deleteFromWorkspaces('dist');

  if (!(await inquirerConfirmation('Recreate dist'))) return;

  await exec('yarn build');

  inquirerLogger('Recreater', 'monorepo freshly built');
};

const turboRepo = () => deleteFromWorkspaces('.turbo', [ROOT, ...workspaces]);
const coverage = () => deleteFromWorkspaces('coverage');
const swc = () => deleteFromWorkspaces('.swc');

const all = async () => {
  await nodeModules();
  await dist();
  await Promise.all([turboRepo(), coverage(), swc()]);
};

purge();
