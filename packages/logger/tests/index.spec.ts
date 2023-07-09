/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import chalk from "chalk";
import { DEFAULT_LOG_LEVELS, Logger } from "../src/index.js";
import { vi } from "vitest";

DEFAULT_LOG_LEVELS.forEach((logLevel) => {
  describe(`logging of ${logLevel}`, () => {
    it(`should ${logLevel}`, () => {
      const logger = new Logger(logLevel);

      Logger["lastTimeStampAt"] = 0;

      const mock = vi.fn();

      process.stdout.write = mock;
      process.stderr.write = mock;

      logger[logLevel]("message");

      expect(mock).toHaveBeenCalledWith(
        `${chalk.bold(`${logLevel === "error" ? "📉" : "📈"}`)} ${chalk.hex(
          logger["getColorByLogLevel"](logLevel).toString(16)
        )(logLevel)} ${chalk.gray(`0ms`)} message\n`
      );
    });
  });
});

describe(`logging levels`, () => {
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
