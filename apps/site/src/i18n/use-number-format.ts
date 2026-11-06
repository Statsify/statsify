/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { formatNumber } from "./format";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

/** The bot's number format in the active locale: `n(1234567)` → "1.23M"; with `trim`, `n(1.3)` → "1.3", not "1.30". */
export function useNumberFormat(trim = false) {
  const { i18n } = useTranslation();
  return useCallback((value: number) => formatNumber(value, i18n.language, trim), [i18n.language, trim]);
}
