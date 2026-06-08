/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Container } from "typedi";
import { Logger } from "@statsify/logger";
import { readdir } from "node:fs/promises";
import { statSync } from "node:fs";
import { join } from "node:path";
import type { CommandResolvable } from "./command.resolvable.js";
import { scanCommands } from "./command.builder.js";
import { pathToFileURL } from "node:url";

const logger = new Logger("CommandLoader");

export async function loadCommands(dir: string) {
  const files = await getCommandFileUrls(dir);
  const commands = await Promise.all(files.map(importCommand));

  return new Map<string, CommandResolvable>(
    commands
      .flat()
      .filter((command) => command !== undefined)
      .map((command) => [command.name, command] as const),
  );
}

async function importCommand(file: string) {
  const command = await import(file);

  return Object.keys(command)
    .filter((key) => key !== "default")
    .filter((key) => {
      const value = command[key];
      // try to filter out function exports since classes will not have a writeable prototype.
      return (
        typeof value === "function" &&
        !Object.getOwnPropertyDescriptor(value, "prototype")?.writable
      );
    })
    .map((key) => {
      try {
        const constructor = command[key];
        const instance = Container.get<object>(constructor);

        return scanCommands(instance, constructor);
      } catch (err) {
        logger.error(`Failed to load command in ${file} with import ${key}`);
        logger.error(err);
        return undefined;
      }
    });
}

async function getCommandFileUrls(dir: string): Promise<string[]> {
  const toLoad: string[] = [];

  const files = await readdir(dir);

  await Promise.all(
    files.map(async (file) => {
      const path = join(dir, file);

      if (statSync(path).isDirectory()) {
        toLoad.push(...(await getCommandFileUrls(path)));
      } else if (file.endsWith(".command.js")) {
        toLoad.push(pathToFileURL(path).href);
      }
    }),
  );

  return toLoad;
}
