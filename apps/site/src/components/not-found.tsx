/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Button } from "~/components/ui/button";
import { Error } from "~/components/ui/error";
import { Link } from "@tanstack/react-router";
import { LogoError } from "~/components/icons/logo-error";
import { useTranslation } from "react-i18next";

// Default values keep the page readable when it renders above the locale layout (no translations yet).
export function NotFound() {
  const { t } = useTranslation();

  return (
    <Error>
      <LogoError className="size-40 sm:size-64" />
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-mc-3 sm:text-mc-4 font-bold text-mc-red">{t("notFound.title", "OOPS!")}</h1>
        <p className="font-sans text-16 sm:text-20 font-medium text-mc-gray">
          {t("notFound.description", "Looks like the page you're trying to reach does not exist")}
        </p>
        <Button asChild variant="primary" className="mt-2 min-w-48">
          <Link to="/{-$locale}">{t("error.home", "Home")}</Link>
        </Button>
      </div>
    </Error>
  );
}
