/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { FILE_ENDINGS, FILE_ENDING_REGEX, ROOT, fetchWorkspaces } from "./utils.js";
import { Logger } from "@statsify/logger";
import { basename, join } from "node:path";
import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { transformFile } from "@swc/core";
import { watch } from "chokidar";

const IGNORED_WORKSPACES = ["site", "scripts"];

const logger = new Logger();

const workspaces = [
  ...(await fetchWorkspaces("apps", IGNORED_WORKSPACES)),
  ...(await fetchWorkspaces("packages", IGNORED_WORKSPACES)),
];

/**
 *
 * @param {string} path
 */
function getWorkspaceFromPath(path) {
  return path.replace(ROOT, "").split("/")[1];
}

/**
 * @type {Map<string,string>}
 */
const configs = new Map();

/**
 *
 * @param {string} workspace The workspace
 */
async function fetchConfig(workspace) {
  const configPath = join(workspace, ".swcrc");
  if (existsSync(configPath)) return configPath;
  return join(ROOT, ".swcrc");
}

await Promise.all(
  workspaces.map((workspace) =>
    fetchConfig(workspace).then((config) =>
      configs.set(getWorkspaceFromPath(workspace), config)
    )
  )
);

let isReady = false;

/**
 *
 * @param {string} path
 */
function shouldProcess(path) {
  if (!isReady) return false;
  if (!FILE_ENDINGS.some((ending) => path.endsWith(ending))) return false;
  return true;
}

/**
 *
 * @param {string} path
 */
async function handleFile(path) {
  if (!shouldProcess(path)) return;

  const workspace = getWorkspaceFromPath(path);
  const configFile = configs.get(workspace);

  if (!configFile) return;

  try {
    let { code, map } = await transformFile(path, { configFile });

    const srcFileName = basename(path);
    const distFileName = srcFileName.replace(FILE_ENDING_REGEX, ".js");
    const distFolder = path.replace("src", "dist").replace(srcFileName, "");

    let files = [mkdir(distFolder, { recursive: true })];

    if (map) {
      const mapFileName = `${distFileName}.map`;
      code += `\n//# sourceMappingURL=${mapFileName}`;
      files.push(writeFile(join(distFolder, mapFileName), map));
    }

    files.push(writeFile(join(distFolder, distFileName), code));

    await Promise.all(files);

    logger.setContext(workspace);
    logger.log(`COMPILE ${srcFileName} -> ${distFileName}`);
  } catch (err) {
    console.error(err);
  }
}

async function deleteFile(path) {
  if (!shouldProcess(path)) return;

  const workspace = getWorkspaceFromPath(path);

  const srcFileName = basename(path);
  const distFileName = srcFileName.replace(FILE_ENDING_REGEX, ".js");
  const distPath = path.replace("src", "dist").replace(srcFileName, distFileName);

  await rm(distPath, { force: true });

  logger.setContext(workspace);
  logger.error(`DELETE ${srcFileName} -> ${distFileName}`);
}

const watcher = watch(
  workspaces.map((workspace) => join(workspace, "/src/**/*")),
  { ignored: [/node_modules/] }
);

watcher.on("ready", () => {
  isReady = true;
  logger.setContext("build-watch");
  logger.log("Ready");
});

watcher.on("change", handleFile);
watcher.on("add", handleFile);
watcher.on("unlink", deleteFile);
