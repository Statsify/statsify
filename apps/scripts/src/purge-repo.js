/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import inquirer from "inquirer";
import { ROOT, fetchWorkspaces, inquirerConfirmation, inquirerLogger } from "./utils.js";
import { join, resolve } from "node:path";
import { once } from "node:events";
import { rm } from "node:fs/promises";
import { spawn } from "node:child_process";

const dirname = import.meta.dirname;

/**
 *
 * @param {string} script
 */
const exec = async (script) => {
  const child = spawn(script, {
    shell: true,
    stdio: "inherit",
    cwd: resolve(dirname, "../../../"),
  });

  const [code] = await once(child, "exit");
  if (code !== 0) throw new Error(`${script} exited with code ${code}`);
};

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

const nodeModules = async () => {
  await deleteFromWorkspaces("node_modules", [ROOT, ...workspaces]);

  if (!(await inquirerConfirmation("Recreate node_modules"))) return;

  await exec("pnpm install");

  inquirerLogger("Recreater", "node_modules installed");
};

const dist = async () => {
  await deleteFromWorkspaces("dist");

  if (!(await inquirerConfirmation("Recreate dist"))) return;

  await exec("pnpm build");

  inquirerLogger("Recreater", "monorepo freshly built");
};

const turboRepo = () => deleteFromWorkspaces(".turbo", [ROOT, ...workspaces]);
const coverage = () => deleteFromWorkspaces("coverage");
const swc = () => deleteFromWorkspaces(".swc");

const all = async () => {
  await Promise.all([turboRepo(), coverage(), swc()]);
  await nodeModules();
  await dist();
};

const purge = async () => {
  if (process.argv.includes("--dist")) {
    await deleteFromWorkspaces("dist");
    return process.exit(0);
  }

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
    case "node_modules":
      await nodeModules();
      break;

    case ".turbo":
      await turboRepo();
      break;

    case "dist":
      await dist();
      break;

    case "coverage":
      await coverage();
      break;

    case ".swc":
      await swc();
      break;

    case "ALL":
      await all();
      break;
  }

  process.exit(0);
};

await purge();
