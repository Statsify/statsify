/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import chalk from "chalk";
import inquirer from "inquirer";
import { join } from "node:path";
import { readdir } from "node:fs/promises";
export const inquirerLogger = (title, message, newLine = true) => {
	console.log(`${newLine ? "\n" : ""}${chalk.magenta("!")} ${chalk.bold(title)} ${chalk.magenta(message)}`);
};

export const inquirerConfirmation = async (message = "Are you sure?", selected = true) =>
	(
		await inquirer.prompt([
			{
				type: "confirm",
				name: "confirmation",
				message,
				default: selected,
			},
		])
	).confirmation;

export const ROOT = "../../";
export const FILE_ENDINGS = [".tsx", ".mts", ".cts", ".ts"];
export const FILE_ENDING_REGEX = new RegExp(/\.tsx|\.mts|\.cts|\.ts/);

/**
 *
 * @param {string} path
 * @param {string} ignoredWorkspaces
 */
export async function fetchWorkspaces(path, ignoredWorkspaces = []) {
	const workspaces = await readdir(join(ROOT, path));

	return workspaces.filter((workspace) => !ignoredWorkspaces.includes(workspace)).map((workspace) => join(ROOT, path, workspace));
}
