/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import i18next from "i18next";
import { createLocalizeFunction, formatInterpolation } from "../localize.js";
import { readFile } from "node:fs/promises";
import type { LocalizeFunction } from "../types.js";

/** Like the bot and `@statsify/assets`, relative to the app's working directory (`apps/<app>`). */
const LOCALES = "../../locales";
const LANGUAGE = "en-US";

let localizer: Promise<LocalizeFunction> | undefined;

/**
 * A translator for the bot's `default` namespace in English, loaded once. The site ships only English, so its cards do
 * too until a second locale ships.
 */
export function getLocalizeFunction(): Promise<LocalizeFunction> {
  localizer ??= create();
  return localizer;
}

async function create(): Promise<LocalizeFunction> {
  const file = await readFile(`${LOCALES}/${LANGUAGE}/default.json`, "utf8");
  const instance = i18next.createInstance();

  await instance.init({
    lng: LANGUAGE,
    resources: { [LANGUAGE]: { default: JSON.parse(file) } },
    ns: ["default"],
    defaultNS: "default",
    initImmediate: false,
    interpolation: {
      escapeValue: false,
      format: formatInterpolation,
    },
  });

  return createLocalizeFunction(instance.getFixedT(LANGUAGE), LANGUAGE);
}
