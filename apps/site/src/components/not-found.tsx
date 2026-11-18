/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Error } from "~/components/ui/error";
import { LogoError } from "~/components/icons/logo-error";
import { useTranslation } from "react-i18next";

const SHADES = ["text-redify-100", "text-redify-200", "text-redify-300", "text-redify-400", "text-redify-500"];

// Default values keep the page readable when it renders above the locale layout (no translations yet).
export function NotFound() {
  const { t } = useTranslation();
  const title = t("notFound.title", "OOPS!");

  return (
    <Error>
      <LogoError className="size-64 lg:size-80" />
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-mc-4 lg:text-mc-7 font-bold">
          {[...title].map((char, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <span key={index} className={SHADES[index % SHADES.length]}>{char}</span>
          ))}
        </h1>
        <p className="text-20 font-medium text-mc-gray text-center">
          {t("notFound.description", "Looks like the page you're trying to reach does not exist")}
        </p>
      </div>
    </Error>
  );
}
