/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import type { LocalizeFunction } from "./types.js";
import type { TFunction } from "i18next";

/** Wraps an i18next `t` so that `t(1234)` formats through the `number` key, as the profiles expect. */
export function createLocalizeFunction(fixedT: TFunction, locale: string): LocalizeFunction {
  const t = (...args: Parameters<LocalizeFunction>) => {
    if (typeof args[0] === "number") return fixedT("number", { value: args[0] });
    return fixedT(...(args as unknown as Parameters<TFunction>));
  };

  Object.defineProperty(t, "locale", { value: locale });

  return t as LocalizeFunction;
}
