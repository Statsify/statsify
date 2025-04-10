/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { CommandBuilder } from "./command.builder.js";
import { Container } from "typedi";
import { Logger } from "@statsify/logger";
import { readdir } from "node:fs/promises";
import { statSync } from "node:fs";
import type { CommandResolvable } from "./command.resolvable.js";

export class CommandLoader {
  private static readonly logger = new Logger("CommandLoader");

  public static async load(dir: string) {
    const commands = new Map<string, CommandResolvable>();
    const files = await this.getCommandFiles(dir);

    for (const file of files) {
      const imports = await this.importCommand(file);

      for (const command of imports) {
        if (!command) continue;
        commands.set(command.name, command);
      }
    }

    return commands;
  }

  private static async importCommand(file: string) {
    const command = await import(file);

    return Object.keys(command)
      .filter((key) => key !== "default")
      .filter((key) => {
        const value = command[key];
        // try to filter out function exports since classes will not have a writeable prototype.
        return typeof value === "function" && !(Object.getOwnPropertyDescriptor(value, "prototype")?.writable);
      })
      .map((key) => {
        try {
          const constructor = command[key];
          const instance = Container.get<object>(constructor);

          return CommandBuilder.scan(instance, constructor);
        } catch (err) {
          this.logger.error(`Failed to load command in ${file} with import ${key}`);
          this.logger.error(err);
        }
      });
  }

  private static async getCommandFiles(dir: string): Promise<string[]> {
    const toLoad: string[] = [];

    const files = await readdir(dir);

    await Promise.all(
      files.map(async (file) => {
        const path = `${dir}/${file}`;

        if (statSync(path).isDirectory()) {
          toLoad.push(...(await this.getCommandFiles(path)));
        } else if (file.endsWith(".command.js")) {
          toLoad.push(path);
        }
      })
    );

    return toLoad;
  }
}
