/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import inquirer from "inquirer";
import { ROOT, fetchWorkspaces, inquirerConfirmation, inquirerLogger } from "./utils.js";
import { exec as _exec } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { rm } from "node:fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 *
 * @param {string} script
 */
const exec = (script) =>
  promisify(_exec)(script, {
    shell: true,
    stdio: "inherit",
    cwd: resolve(__dirname, "../../../"),
  });

const workspaces = [
  ...(await fetchWorkspaces("apps")),
  ...(await fetchWorkspaces("packages")),
];

/**
 *
 * @param {string} path
 * @param {string[]} _workspaces
 * @returns {Promise<void>}
 */
function deleteFromWorkspaces(path, _workspaces = workspaces) {
  return Promise.all(
    _workspaces.map((workspace) =>
      rm(join(workspace, path), { recursive: true, force: true })
    )
  );
}

const purge = async () => {
  const { method } = await inquirer.prompt([
    {
      type: "list",
      name: "method",
      message: "Purge Action?",
      choices: ["node_modules", ".turbo", "dist", "coverage", ".swc", "ALL"],
      default: "create",
    },
  ]);

  if (!(await inquirerConfirmation())) return;

  switch (method) {
    case "node_modules": {
      await nodeModules();
      break;
    }
    case ".turbo": {
      await turboRepo();
      break;
    }
    case "dist": {
      await dist();
      break;
    }
    case "coverage": {
      await coverage();
      break;
    }
    case ".swc": {
      await swc();
      break;
    }
    case "ALL":
      {
        await all();
        // No default
      }
      break;
  }
  process.exit(0);
};

const nodeModules = async () => {
  await deleteFromWorkspaces("node_modules", [ROOT, ...workspaces]);

  if (!(await inquirerConfirmation("Recreate node_modules"))) return;

  await exec("yarn");

  inquirerLogger("Recreater", "node_modules installed");
};

const dist = async () => {
  await deleteFromWorkspaces("dist");

  if (!(await inquirerConfirmation("Recreate dist"))) return;

  await exec("yarn build");

  inquirerLogger("Recreater", "monorepo freshly built");
};

const turboRepo = () => deleteFromWorkspaces(".turbo", [ROOT, ...workspaces]);
const coverage = () => deleteFromWorkspaces("coverage");
const swc = () => deleteFromWorkspaces(".swc");

const all = async () => {
  await nodeModules();
  await dist();
  await Promise.all([turboRepo(), coverage(), swc()]);
};

purge();
