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

const DEFAULT_LOG_LEVELS: LogLevel[] = ["log", "error", "warn", "debug", "verbose", "fatal"];

type SentryTagValue = boolean | number | string | null | undefined;

type SentryLogLevel = Extract<LogLevel, "error" | "fatal" | "warn">;

export interface SentrySpanOptions {
  op: string;
  description?: string;
  data?: Record<string, unknown>;
  tags?: Record<string, SentryTagValue>;
}

export const STATUS_COLORS = {
  debug: 0xC700E7,
  warn: 0xFAB627,
  error: 0xCD1820,
  info: 0x6469F5,
  success: 0x36D494,
  fatal: 0x81181A,
} as const;

const ColorByLogLevel: Record<LogLevel, number> = {
  debug: STATUS_COLORS.debug,
  warn: STATUS_COLORS.warn,
  error: STATUS_COLORS.error,
  verbose: STATUS_COLORS.info,
  log: STATUS_COLORS.success,
  fatal: STATUS_COLORS.fatal,
};

const isProduction = await config("environment") === "prod";

export function getSentryTransaction() {
  return Sentry.getCurrentHub().getScope()?.getTransaction();
}

export function startSentrySpan({
  op,
  description,
  data,
  tags,
}: SentrySpanOptions) {
  const span = getSentryTransaction()?.startChild({ op, description, data });

  for (const [key, value] of Object.entries(tags ?? {})) {
    if (value === null || value === undefined) continue;
    span?.setTag(key, String(value));
  }

  return span;
}

export async function withSentrySpan<T>(
  options: SentrySpanOptions,
  callback: (span?: Sentry.Span) => Promise<T>
): Promise<T> {
  const span = startSentrySpan(options);

  try {
    return await callback(span);
  } finally {
    span?.finish();
  }
}

export function withSentrySpanSync<T>(
  options: SentrySpanOptions,
  callback: (span?: Sentry.Span) => T
): T {
  const span = startSentrySpan(options);

  try {
    return callback(span);
  } finally {
    span?.finish();
  }
}

export function setSentryMemoryUsage(span = getSentryTransaction()) {
  if (!span) return;

  const { rss, heapUsed } = process.memoryUsage();

  span.setData("memory.rss.bytes", rss);
  span.setData("memory.heap_used.bytes", heapUsed);
}

function stringifyMessage(message: unknown) {
  if (message instanceof Error) return message.message;
  if (typeof message === "string") return message;
  if (typeof message !== "object" || message === null) return String(message);

  try {
    return JSON.stringify(message);
  } catch {
    return String(message);
  }
}

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
  public log(message: any, ...optionalParameters: [...any, string?]): void;
  public log(message: any, ...optionalParameters: any[]) {
    if (!this.isLevelEnabled("log")) {
      return;
    }

    const { messages, context } = this.getContextAndMessages([
      message,
      ...optionalParameters,
    ]);

    Logger.printMessage(messages, context, "log");
  }

  public error(message: any, context?: string): void;
  public error(message: any, ...optionalParameters: [...any, string?]): void;
  public error(message: any, ...optionalParameters: any[]) {
    if (!this.isLevelEnabled("error")) {
      return;
    }

    let normalizedMessage = message;

    if (message instanceof Error) {
      const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();
      transaction?.setStatus("internal_error");

      Sentry.captureException(message);
      normalizedMessage = message.stack;
    }

    const { messages, context } = this.getContextAndMessages([
      normalizedMessage,
      ...optionalParameters,
    ]);

    const sentryLog = this.getContextAndMessages([message, ...optionalParameters]);

    Logger.captureSentryLog(sentryLog.messages, sentryLog.context, "error");
    Logger.printMessage(messages, context, "error", "stderr", "📉");
  }

  public warn(message: any, context?: string): void;
  public warn(message: any, ...optionalParameters: [...any, string?]): void;
  public warn(message: any, ...optionalParameters: any[]) {
    if (!this.isLevelEnabled("warn")) {
      return;
    }

    const { messages, context } = this.getContextAndMessages([
      message,
      ...optionalParameters,
    ]);

    Logger.captureSentryLog(messages, context, "warn");
    Logger.printMessage(messages, context, "warn");
  }

  public debug(message: any, context?: string): void;
  public debug(message: any, ...optionalParameters: [...any, string?]): void;
  public debug(message: any, ...optionalParameters: any[]) {
    if (!this.isLevelEnabled("debug")) {
      return;
    }

    const { messages, context } = this.getContextAndMessages([
      message,
      ...optionalParameters,
    ]);

    Logger.printMessage(messages, context, "debug");
  }

  public verbose(message: any, context?: string): void;
  public verbose(message: any, ...optionalParameters: [...any, string?]): void;
  public verbose(message: any, ...optionalParameters: any[]): void {
    if (!this.isLevelEnabled("verbose")) {
      return;
    }

    const { messages, context } = this.getContextAndMessages([
      message,
      ...optionalParameters,
    ]);

    Logger.printMessage(messages, context, "verbose");
  }

  public fatal(message: any, context?: string): void;
  public fatal(message: any, ...optionalParameters: [...any, string?]): void;
  public fatal(message: any, ...optionalParameters: any[]) {
    if (!this.isLevelEnabled("fatal")) {
      return;
    }

    let normalizedMessage = message;

    if (message instanceof Error) {
      const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();
      transaction?.setStatus("internal_error");

      Sentry.captureException(message);
      normalizedMessage = message.stack;
    }

    const { messages, context } = this.getContextAndMessages([
      normalizedMessage,
      ...optionalParameters,
    ]);

    const sentryLog = this.getContextAndMessages([message, ...optionalParameters]);

    Logger.captureSentryLog(sentryLog.messages, sentryLog.context, "fatal");
    Logger.printMessage(messages, context, "fatal", "stderr", "📉");
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

    const lastElement = messages.at(-1);
    const isContext = typeof lastElement === "string";

    if (isContext) {
      return {
        messages: messages.slice(0, -1),
        context: lastElement,
      };
    }

    return { messages, context: this.context };
  }

  private static getTimeStamp() {
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

  private static printMessage(
    messages: unknown[],
    context = "Default",
    logLevel: LogLevel = "log",
    writeStreamType: "stdout" | "stderr" = "stdout",
    icon = "📈"
  ) {
    const color = ColorByLogLevel[logLevel];

    for (const message of messages) {
      const output = typeof message === "object" ? JSON.stringify(message) : message;
      const timeStamp = Logger.getTimeStamp();

      const computedMessage = `${chalk.bold(`${icon}`)} ${chalk.hex(color.toString(16))(
        context
      )} ${chalk.gray(`${timeStamp}${isProduction ? "" : "ms"}`)} ${output}\n`;

      process[writeStreamType].write(computedMessage);
    }
  }

  private static captureSentryLog(
    messages: unknown[],
    context: string | undefined,
    logLevel: SentryLogLevel
  ) {
    for (const message of messages) {
      Sentry.logger[logLevel](stringifyMessage(message), {
        "logger.context": context ?? "Default",
        "logger.level": logLevel,
        ...(message instanceof Error ?
          {
            "error.name": message.name,
            "error.message": message.message,
          } :
          {}),
      });
    }
  }
}



if (import.meta.vitest) {
  const { suite, it, expect, vi } = import.meta.vitest;

  for (const logLevel of DEFAULT_LOG_LEVELS) {
    suite(`logging of ${logLevel}`, () => {
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
  }

  suite("logging levels", () => {
    it("should ignore all log levels", () => {
      const logger = new Logger("default", { logLevels: [] });

      const mock = vi.fn();

      process.stdout.write = mock;
      process.stderr.write = mock;

      for (const logLevel of DEFAULT_LOG_LEVELS) {
        logger[logLevel]("message");
      }

      expect(mock).not.toHaveBeenCalled();
    });
  });
}
