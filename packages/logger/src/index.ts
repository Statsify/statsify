/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import * as Sentry from "@sentry/node";
import chalk from "chalk";
import { DateTime } from "luxon";
import { config } from "@statsify/util";
import type { ConsoleLoggerOptions, LogLevel, LoggerService } from "@nestjs/common";

const DEFAULT_LOG_LEVELS: LogLevel[] = ["log", "error", "warn", "debug", "verbose"];

export const STATUS_COLORS = {
  debug: 0xc700e7,
  warn: 0xfab627,
  error: 0xcd1820,
  info: 0x6469f5,
  success: 0x36d494,
} as const;

const isProduction = config("environment") === "prod";

/**
 * A logger implementing the NestJS LoggerService interface. However can be used anywhere.
 * Outputs: {icon} {context} {time} {message}
 * @implements {LoggerService}
 */
export class Logger implements LoggerService {
  private originalContext?: string;
  private static lastTimeStampAt?: number;

  public constructor(
    protected context?: string,
    protected options: ConsoleLoggerOptions = {}
  ) {
    if (!this.options.logLevels) {
      this.options.logLevels = DEFAULT_LOG_LEVELS;
    }

    if (context) {
      this.originalContext = context;
    }
  }

  public log(message: any, context?: string): void;
  public log(message: any, ...optionalParams: [...any, string?]): void;
  public log(message: any, ...optionalParams: any[]) {
    if (!this.isLevelEnabled("log")) {
      return;
    }

    const { messages, context } = this.getContextAndMessages([
      message,
      ...optionalParams,
    ]);

    this.printMessage(messages, context, "log");
  }

  public error(message: any, context?: string): void;
  public error(message: any, ...optionalParams: [...any, string?]): void;
  public error(message: any, ...optionalParams: any[]) {
    if (!this.isLevelEnabled("error")) {
      return;
    }

    if (message instanceof Error) {
      const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();
      transaction?.setStatus("internal_error");

      Sentry.captureException(message);
      message = message.stack;
    }

    const { messages, context } = this.getContextAndMessages([
      message,
      ...optionalParams,
    ]);

    this.printMessage(messages, context, "error", "stderr", "📉");
  }

  public warn(message: any, context?: string): void;
  public warn(message: any, ...optionalParams: [...any, string?]): void;
  public warn(message: any, ...optionalParams: any[]) {
    if (!this.isLevelEnabled("warn")) {
      return;
    }

    const { messages, context } = this.getContextAndMessages([
      message,
      ...optionalParams,
    ]);

    this.printMessage(messages, context, "warn");
  }

  public debug(message: any, context?: string): void;
  public debug(message: any, ...optionalParams: [...any, string?]): void;
  public debug(message: any, ...optionalParams: any[]) {
    if (!this.isLevelEnabled("debug")) {
      return;
    }

    const { messages, context } = this.getContextAndMessages([
      message,
      ...optionalParams,
    ]);

    this.printMessage(messages, context, "debug");
  }

  public verbose(message: any, context?: string): void;
  public verbose(message: any, ...optionalParams: [...any, string?]): void;
  public verbose(message: any, ...optionalParams: any[]): void {
    if (!this.isLevelEnabled("verbose")) {
      return;
    }

    const { messages, context } = this.getContextAndMessages([
      message,
      ...optionalParams,
    ]);

    this.printMessage(messages, context, "verbose");
  }

  public setLogLevels(levels: LogLevel[]) {
    this.options.logLevels = levels;
  }

  public setContext(context: string) {
    this.context = context;
  }

  public resetContext() {
    this.context = this.originalContext;
  }

  public isLevelEnabled(level: LogLevel) {
    return this.options.logLevels?.includes(level) ?? false;
  }

  private getContextAndMessages(messages: unknown[]) {
    if (messages.length <= 1) {
      return { messages, context: this.context };
    }

    const lastEl = messages.at(-1);
    const isContext = typeof lastEl === "string";

    if (isContext) {
      return {
        messages: messages.slice(0, -1),
        context: lastEl,
      };
    }

    return { messages, context: this.context };
  }

  private getColorByLogLevel(logLevel: LogLevel) {
    switch (logLevel) {
      case "debug":
        return STATUS_COLORS.debug;

      case "warn":
        return STATUS_COLORS.warn;

      case "error":
        return STATUS_COLORS.error;

      case "verbose":
        return STATUS_COLORS.info;

      case "log":
        return STATUS_COLORS.success;
    }
  }

  private getTimeStamp() {
    if (isProduction) return DateTime.now().toFormat("h:mma");

    const now = Date.now();

    if (!Logger.lastTimeStampAt) {
      Logger.lastTimeStampAt = now;
      return 0;
    }

    const diff = now - Logger.lastTimeStampAt;
    Logger.lastTimeStampAt = now;

    return diff;
  }

  private printMessage(
    messages: unknown[],
    context = "Default",
    logLevel: LogLevel = "log",
    writeStreamType: "stdout" | "stderr" = "stdout",
    icon = "📈"
  ) {
    const color = this.getColorByLogLevel(logLevel);

    messages.forEach((message) => {
      const output = typeof message === "object" ? JSON.stringify(message) : message;
      const timeStamp = this.getTimeStamp();

      const computedMessage = `${chalk.bold(`${icon}`)} ${chalk.hex(color.toString(16))(
        context
      )} ${chalk.gray(`${timeStamp}${isProduction ? "" : "ms"}`)} ${output}\n`;

      process[writeStreamType].write(computedMessage);
    });
  }
}

if (import.meta.vitest) {
  const { test, it, expect, vi } = import.meta.vitest;

  DEFAULT_LOG_LEVELS.forEach((logLevel) => {
    test(`logging of ${logLevel}`, () => {
      it(`should ${logLevel}`, () => {
        const logger = new Logger(logLevel);

        Logger["lastTimeStampAt"] = 0;

        const mock = vi.fn();

        process.stdout.write = mock;
        process.stderr.write = mock;

        logger[logLevel]("message");

        expect(mock).toHaveBeenCalledOnce();
      });
    });
  });

  test("logging levels", () => {
    it("should ignore all log levels", () => {
      const logger = new Logger("default", { logLevels: [] });

      const mock = vi.fn();

      process.stdout.write = mock;
      process.stderr.write = mock;

      DEFAULT_LOG_LEVELS.forEach((logLevel) => {
        logger[logLevel]("message");
      });

      expect(mock).not.toHaveBeenCalled();
    });
  });
}
