import chalk from 'chalk';
import { readdir } from 'fs/promises';
import inquirer from 'inquirer';
import { join } from 'path';
export const inquirerLogger = (title, message, newLine = true) => {
  console.log(
    `${newLine ? '\n' : ''}${chalk.magenta('!')} ${chalk.bold(title)} ${chalk.magenta(message)}`
  );
};

export const inquirerConfirmation = async (message = 'Are you sure?', selected = true) =>
  (
    await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmation',
        message,
        default: selected,
      },
    ])
  ).confirmation;

export const ROOT = '../../';
export const FILE_ENDINGS = ['.tsx', '.mts', '.cts', '.ts'];
export const FILE_ENDING_REGEX = new RegExp(/\.tsx|\.mts|\.cts|\.ts/);

/**
 *
 * @param {string} path
 * @param {string} ignoredWorkspaces
 */
export async function fetchWorkspaces(path, ignoredWorkspaces = []) {
  const workspaces = await readdir(join(ROOT, path));

  return workspaces
    .filter((workspace) => !ignoredWorkspaces.includes(workspace))
    .map((workspace) => join(ROOT, path, workspace));
}
