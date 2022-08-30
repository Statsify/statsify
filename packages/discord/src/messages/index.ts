/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

export * from "./base.message.js";
export * from "./components/index.js";
export * from "./embed.js";
export type { LocalizationString, LocalizeFunction } from "./localize.js";
export {
  getLocalizeFunction,
  translateField,
  translateObject,
  translateToAllLanguages,
} from "./localize.js";
