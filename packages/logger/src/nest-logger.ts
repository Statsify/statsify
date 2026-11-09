/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { type LogLevel, Logger } from "./logger.js";
import type { LoggerService } from "@nestjs/common";

const STACK_PATTERN = /\n\s+at /;

/**
 * Nest calls `error(message, stack?, context?)` and every other level with `(message, context?)`,
 * where the context is the last argument.
 */
export class NestLogger implements LoggerService {
  public log(message: unknown, ...parameters: unknown[]) {
    this.write("log", message, parameters);
  }

  public warn(message: unknown, ...parameters: unknown[]) {
    this.write("warn", message, parameters);
  }

  public debug(message: unknown, ...parameters: unknown[]) {
    this.write("debug", message, parameters);
  }

  public verbose(message: unknown, ...parameters: unknown[]) {
    this.write("verbose", message, parameters);
  }

  public fatal(message: unknown, ...parameters: unknown[]) {
    this.write("fatal", message, parameters);
  }

  public error(message: unknown, ...parameters: unknown[]) {
    const [stack, ...rest] = parameters;

    if (typeof stack === "string" && (rest.length > 0 || STACK_PATTERN.test(stack))) {
      this.write("error", `${message}\n${stack}`, rest);
    } else {
      this.write("error", message, parameters);
    }
  }

  private write(level: LogLevel, message: unknown, parameters: unknown[]) {
    const context = parameters.at(-1);
    new Logger(typeof context === "string" ? context : undefined)[level](message);
  }
}
