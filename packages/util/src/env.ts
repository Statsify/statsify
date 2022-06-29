/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { existsSync } from "node:fs";
import { join } from "node:path";

let config: any;

const loadConfig = () => {
  if (existsSync(join(__dirname, "../../../config.json"))) {
    return require(join(__dirname, "../../../config.json"));
  } else if (existsSync(join(__dirname, "../../../config.js"))) {
    return require(join(__dirname, "../../../config.js"));
  } else {
    throw new Error("No config file detected!");
  }
};

export interface EnvOptions {
  required?: boolean;
  default?: any;
}

export const env = (
  key: string,
  { required = true, default: defaultValue }: EnvOptions = {}
) => {
  if (config === undefined) {
    config = loadConfig();
  }

  const value = key.split(".").reduce((a: any, b) => a?.[b], config) || undefined;

  const isValueDefined = value !== undefined && value !== "";

  if (!isValueDefined) {
    if (defaultValue) return defaultValue;

    if (required)
      throw new Error(
        `Missing required environment variable: ${key}. Add ${key} to your config`
      );
  }

  return value;
};
