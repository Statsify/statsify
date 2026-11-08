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
import { inspect } from "node:util";

export type LogLevel = "log" | "error" | "warn" | "debug" | "verbose" | "fatal";

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

const SentryLogByLogLevel: Record<LogLevel, typeof Sentry.logger.info> = {
  debug: Sentry.logger.debug,
  warn: Sentry.logger.warn,
  error: Sentry.logger.error,
  verbose: Sentry.logger.trace,
  log: Sentry.logger.info,
  fatal: Sentry.logger.fatal,
};

const isProduction = await config("environment") === "prod";

// Sentry doesn't scrub these, so no Discord usernames or API keys
export type RequestAttributes = {
  "discord.command"?: string;
  "discord.guild.id"?: string;
  "discord.locale"?: string;
  "statsify.user.tier"?: string;
  "statsify.user.uuid"?: string;
  "statsify.mode"?: string;
  "statsify.submode"?: string;
  "statsify.outcome"?: "message";
  "statsify.api.route"?: string;
  "statsify.api.role"?: string;
  "statsify.player"?: string;
  "statsify.player.tag"?: string;
  "statsify.guild.tag"?: string;
  "statsify.cache.hit"?: boolean;
};

export const setRequestAttributes = (attributes: RequestAttributes) => {
  Sentry.setAttributes(attributes);
  Sentry.setTags(attributes);
};

const format = (message: unknown) => {
  if (typeof message === "string") return message;
  if (message instanceof Error) return message.stack ?? `${message.name}: ${message.message}`;
  return inspect(message, { depth: 3, breakLength: Infinity, compact: true });
};

/**
 * Prints `{icon} {context} {time} {message}` and sends the message to Sentry Logs.
 * Errors passed to `error` or `fatal` are also captured as Sentry issues.
 */
export class Logger {
  private static lastTimeStampAt?: number;

  public constructor(private readonly context = "Default") {}

  public log(message: unknown) {
    this.write("log", message);
  }

  public error(message: unknown) {
    this.write("error", message);
  }

  public warn(message: unknown) {
    this.write("warn", message);
  }

  public debug(message: unknown) {
    this.write("debug", message);
  }

  public verbose(message: unknown) {
    this.write("verbose", message);
  }

  public fatal(message: unknown) {
    this.write("fatal", message);
  }

  private write(level: LogLevel, message: unknown) {
    const isError = level === "error" || level === "fatal";
    const output = format(message);

    if (isError && message instanceof Error) {
      const span = Sentry.getActiveSpan();
      if (span) Sentry.getRootSpan(span).setStatus({ code: 2, message: "internal_error" });

      Sentry.captureException(message);
    }

    const color = ColorByLogLevel[level];
    const timeStamp = Logger.getTimeStamp();

    process[isError ? "stderr" : "stdout"].write(
      `${chalk.bold(isError ? "📉" : "📈")} ${chalk.hex(color.toString(16))(this.context)} ${chalk.gray(
        `${timeStamp}${isProduction ? "" : "ms"}`
      )} ${output}\n`
    );

    SentryLogByLogLevel[level](message instanceof Error ? message.message : output, {
      context: this.context,
      ...(message instanceof Error && { "error.type": message.name }),
    });
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
}

if (import.meta.vitest) {
  const { suite, it, expect, vi } = import.meta.vitest;

  const levels: LogLevel[] = ["log", "error", "warn", "debug", "verbose", "fatal"];

  for (const logLevel of levels) {
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
}
