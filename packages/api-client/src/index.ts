/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export * from "./api.service.js";
export * from "./enums/index.js";
export * from "./exceptions/index.js";
export * from "./responses/index.js";

export const GUILD_ID_REGEX = /^(?=[\da-f]{24}$)(\d+[a-f]|[a-f]+\d)/i;
