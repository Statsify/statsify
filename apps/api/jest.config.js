/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

const fs = require("fs");

const config = JSON.parse(fs.readFileSync(`../../.swcrc`, "utf8"));

/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
module.exports = {
  testMatch: ["<rootDir>/tests/**/*.spec.ts"],
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest", config],
  },
};

process.env["HYPIXEL_API_KEY"] = "test-key";
process.env["HYPIXEL_API_TIMEOUT"] = 5000;
