/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import Backend from "i18next-fs-backend";
import i18next from "i18next";
import { Service } from "typedi";
import { abbreviationNumber } from "@statsify/util";
import { readdir } from "node:fs/promises";

const DEFAULT_LANGUAGE = "en-US";

@Service()
export class I18nLoaderService {
  private languages: string[] = [];
  private namespaces: string[] = [];

  public async init() {
    const languageEntries = await readdir("../../locales", { withFileTypes: true });
    this.languages = languageEntries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    const namespaceEntries = await readdir(`../../locales/${DEFAULT_LANGUAGE}/`, {
      withFileTypes: true,
    });

    this.namespaces = namespaceEntries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map((entry) => entry.name.replace(".json", ""));

    await i18next.use(Backend).init({
      backend: {
        loadPath: "../../locales/{{lng}}/{{ns}}.json",
      },
      debug: false,
      fallbackLng: DEFAULT_LANGUAGE,
      lng: DEFAULT_LANGUAGE,
      supportedLngs: this.languages,
      ns: this.namespaces,
      load: "all",
      preload: this.languages,
      initImmediate: false,
      defaultNS: "default",
      interpolation: {
        format,
        escapeValue: false,
      },
    });
  }
}

function format(value: any, format?: string | undefined, lng?: string): string {
  switch (format) {
    case "number": {
      const hasDecimals = value >= 1_000_000 || !Number.isInteger(+value);
      const digits = hasDecimals ? 2 : 0;

      const formatOptions = {
        maximumFractionDigits: digits,
        minimumFractionDigits: digits,
      };

      if ((value as number) >= 1_000_000) {
        const [number, suffix] = abbreviationNumber(value);
        return `${Intl.NumberFormat(lng, formatOptions).format(number)}${suffix}`;
      }

      return Intl.NumberFormat(lng, formatOptions).format(value as number);
    }
  }

  return value;
}
