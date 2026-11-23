/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Button } from "~/components/ui/button";
import { Error, ErrorText } from "~/components/ui/error";
import { Link } from "@tanstack/react-router";
import { LogoError } from "~/components/icons/logo-error";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";

// Default values keep the page readable when it renders above the locale layout (no translations yet).
export function NotFound({
  back,
}: {
  /**
   * A link back to where the visitor came from (a player's profile, the leaderboards): the one primary action then,
   * and home a plain link, as on the error page.
   */
  back?: ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <Error>
      <LogoError className="size-40 sm:size-64" />
      <div className="flex w-full flex-col items-center gap-4">
        <ErrorText heading={<h1 className="text-mc-3 sm:text-mc-4 font-bold text-mc-red">{t("notFound.title", "OOPS!")}</h1>}>
          <p className="text-mc-1.5 sm:text-mc-2 text-mc-gray text-center">
            {t("notFound.description", "This page doesn't exist. Check the address, or go back home.")}
          </p>
        </ErrorText>
        {back ?
          (
            <div className="flex flex-col items-center gap-2 pt-2">
              <Button asChild variant="primary" className="min-w-48">
                {back}
              </Button>
              <Link to="/{-$locale}" className="flex min-h-11 items-center text-mc-1 text-mc-white underline">
                {t("error.home", "Home")}
              </Link>
            </div>
          ) :
          (
            <Button asChild variant="primary" className="mt-2 min-w-48">
              <Link to="/{-$locale}">{t("error.home", "Home")}</Link>
            </Button>
          )}
      </div>
    </Error>
  );
}
